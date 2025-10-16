import { GoogleGenAI, GenerateContentResponse, Type, FunctionDeclaration, Content } from "@google/genai";
import type { Workflow, User, DunningPlan, ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const addNoteDeclaration: FunctionDeclaration = {
    name: 'add_note',
    parameters: {
        type: Type.OBJECT,
        properties: {
            workflowId: { type: Type.STRING, description: 'The ID of the workflow to add the note to.' },
            note: { type: Type.STRING, description: 'The content of the note to add.' },
        },
        required: ['workflowId', 'note'],
    },
    description: 'Adds a note to a specific workflow. Use this when the user wants to log information or an interaction.',
};

const runCashflowScenarioDeclaration: FunctionDeclaration = {
    name: 'run_cash_flow_scenario',
    parameters: {
        type: Type.OBJECT,
        properties: {
            modifications: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        workflowId: { type: Type.STRING },
                        newDueDate: { type: Type.STRING, description: 'The new due date in YYYY-MM-DD format.' },
                    },
                    required: ['workflowId', 'newDueDate'],
                },
            },
        },
        required: ['modifications'],
    },
    description: 'Runs a "what-if" cash flow scenario by providing temporary modifications to workflow due dates.',
}

const clearCashflowScenarioDeclaration: FunctionDeclaration = {
    name: 'clear_cash_flow_scenario',
    parameters: { type: Type.OBJECT, properties: {} },
    description: 'Clears any active "what-if" cash flow scenario and returns the forecast to its default state.',
};

const getAnalyticsSummaryDeclaration: FunctionDeclaration = {
    name: 'get_analytics_summary',
    parameters: {
        type: Type.OBJECT,
        properties: {
            reportType: {
                type: Type.STRING,
                enum: ['aging', 'collector_performance'],
                description: 'The type of analytics report to summarize.',
            },
        },
        required: ['reportType'],
    },
    description: 'Retrieves a summary of a specific analytics report (aging or collector performance).',
};

const logDisputeDeclaration: FunctionDeclaration = {
    name: 'log_dispute',
    parameters: {
        type: Type.OBJECT,
        properties: {
            workflowId: { type: Type.STRING, description: 'The ID of the workflow to log the dispute against.' },
            amount: { type: Type.NUMBER, description: 'The disputed amount.' },
            reason: { type: Type.STRING, description: 'A brief, inferred reason for the dispute (e.g., "Unspecified Short Payment", "Pricing Discrepancy").' },
        },
        required: ['workflowId', 'amount', 'reason'],
    },
    description: 'Logs a new dispute case for a workflow, typically triggered by a short payment.',
};


const tools = [{
    functionDeclarations: [
        addNoteDeclaration, 
        runCashflowScenarioDeclaration, 
        clearCashflowScenarioDeclaration,
        getAnalyticsSummaryDeclaration,
        logDisputeDeclaration,
    ]
}];

const mapMessagesToContent = (messages: ChatMessage[]): Content[] => {
    return messages.map(msg => {
        if (msg.role === 'user') {
            return { role: 'user', parts: [{ text: msg.content || '' }] };
        } else { // model
            if (msg.toolCall) {
                return { 
                    role: 'model', 
                    parts: [{ functionCall: msg.toolCall }]
                };
            }
            if (msg.toolResponse) {
                 return { 
                    role: 'model', // This seems odd, but API expects function response to be part of a model turn. Let's try this. If not, it should be a 'user' role with a functionResponse part.
                     parts: [{ functionResponse: msg.toolResponse }]
                };
            }
            return { role: 'model', parts: [{ text: msg.content || '' }] };
        }
    });
};


export const runAgent = async (
    history: ChatMessage[],
    workflows: Workflow[],
    currentUser: User
): Promise<GenerateContentResponse> => {

    const workflowContext = workflows
        .filter(w => w.status !== 'Completed')
        .map(w => ({ id: w.id, client: w.clientName, amount: w.amount, dueDate: w.dueDate, status: w.status, assignee: w.assignee, disputes: w.disputes }));

    const systemInstruction = `You are FazeAR, an expert AI assistant for Accounts Receivable management, integrated into an application.
Your primary role is to act as a helpful agent that can answer questions and perform actions using the tools you've been given.
- When a user asks you to do something, determine which tool is appropriate and call it with the correct parameters.
- You have access to the current user's information and a list of all outstanding invoice workflows. Use this context to find the necessary IDs and data for your tool calls.
- A key part of your role is to act as a Dispute Resolution Analyst. When a short payment is detected, you will be asked to log a dispute using the 'log_dispute' tool.
- After a tool is executed, you will receive the result. Formulate a natural language response to the user confirming the action or presenting the information.
- Be concise and direct in your answers.
- If you need to ask a clarifying question, do so.
- Do not invent data.

Current User: ${JSON.stringify(currentUser)}
Outstanding Workflows Context:
${JSON.stringify(workflowContext, null, 2)}
`;
    
    const contents = mapMessagesToContent(history);
    
    // The API expects the function response to be in a 'user' turn. Let's adjust for that.
    const finalContents = contents.map((content, index) => {
        if (content.parts[0].functionResponse && index > 0 && contents[index-1].role === 'model') {
            return { ...content, role: 'user' };
        }
        return content;
    });


    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: finalContents,
        tools: tools,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.1,
        }
    });
    
    return response;
};


export const analyzeCashApplication = async (remittanceText: string): Promise<GenerateContentResponse> => {
    const systemInstruction = `You are an intelligent cash application assistant. Your task is to parse unstructured remittance text from bank statements or emails and extract structured data about each payment.
The user will provide a block of text. You must identify each distinct payment and extract the client's name, the invoice reference/ID, and the amount paid.
- Return the response as a JSON array of objects.
- Each object in the array should represent a single payment and have the following keys: "clientName", "invoiceId", "amountPaid".
- For "amountPaid", it must be a number, without currency symbols or commas.
- For "invoiceId", extract the most specific identifier you can find (e.g., "inv_123", "...c7f5").
- If the text is malformed or you cannot extract any valid payment information, return an empty array [].
- Do not add any explanatory text outside of the JSON array. Your entire output must be the JSON itself.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: remittanceText,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        clientName: { type: Type.STRING },
                        invoiceId: { type: Type.STRING },
                        amountPaid: { type: Type.NUMBER },
                    },
                    required: ["clientName", "invoiceId", "amountPaid"],
                },
            },
        }
    });

    return response;
};