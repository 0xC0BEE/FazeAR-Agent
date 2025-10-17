import { GoogleGenAI, Chat, GenerateContentResponse, Type, FunctionDeclaration } from "@google/genai";
import type { Workflow, Tone, User } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable is not set. AI features will not work.");
}

// Initialize with a placeholder if the key is missing to avoid crashing the app on startup.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || " " });
const model = 'gemini-2.5-flash';

// --- Function Declarations for the model ---
const assignWorkflow: FunctionDeclaration = {
    name: 'assign_workflow',
    description: 'Assigns a workflow (invoice) to a specific collector.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            clientName: {
                type: Type.STRING,
                description: 'The name of the client associated with the workflow.'
            },
            assigneeName: {
                type: Type.STRING,
                description: 'The name of the collector to assign the workflow to.'
            }
        },
        required: ['clientName', 'assigneeName']
    }
};

const addNoteToWorkflow: FunctionDeclaration = {
    name: 'add_note_to_workflow',
    description: 'Adds a note to a specific client\'s workflow.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            clientName: {
                type: Type.STRING,
                description: 'The name of the client associated with the workflow.'
            },
            note: {
                type: Type.STRING,
                description: 'The content of the note to add.'
            }
        },
        required: ['clientName', 'note']
    }
};

const sendReminder: FunctionDeclaration = {
    name: 'send_reminder',
    description: 'Sends a reminder for a specific invoice.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            invoiceId: {
                type: Type.STRING,
                description: 'The external ID of the invoice (e.g., "inv_1001").'
            },
        },
        required: ['invoiceId']
    }
};

// --- Service Functions ---

let chat: Chat | null = null;

function initializeChat(workflows: Workflow[], users: User[]) {
    const collectorNames = users.filter(u => u.role === 'Collector' || u.role === 'Manager' || u.role === 'Admin').map(u => u.name).join(', ');

    const workflowSummary = workflows
        .filter(w => w.status !== 'Completed')
        .map(w => `- Client: ${w.clientName}, Invoice ID: ${w.externalId}, Amount: $${w.amount.toLocaleString()}, Due: ${w.dueDate}, Assignee: ${w.assignee}`)
        .join('\n');

    const systemInstruction = `You are an expert Accounts Receivable AI assistant named FazeAR. 
Your primary role is to help collections agents manage their workflows efficiently.
You can use tools to perform actions like assigning workflows, adding notes, and sending reminders.
When asked about data, provide concise answers based on the provided context. 
If you need to perform an action, use the available tools.
Do not invent information. If you don't know, say you don't know.

The current date is ${new Date().toLocaleDateString()}.
Available collectors: ${collectorNames}.

Here is the current list of outstanding workflows:
${workflowSummary}
`;
    
    chat = ai.chats.create({
        model: model,
        config: {
            systemInstruction: systemInstruction,
            tools: [{ functionDeclarations: [assignWorkflow, addNoteToWorkflow, sendReminder] }]
        }
    });
}


export const generateResponse = async (
    newMessage: string,
    tone: Tone,
    allWorkflows: Workflow[],
    users: User[]
): Promise<GenerateContentResponse> => {
    
    if (!process.env.API_KEY) {
        return { text: "Error: API_KEY is not configured.", functionCalls: [] } as unknown as GenerateContentResponse;
    }
    
    // Re-initialize chat on every message to ensure it has the latest workflow data.
    initializeChat(allWorkflows, users);
    
    let prompt = newMessage;
    
    if (tone !== 'Default') {
        prompt = `Using a ${tone.toLowerCase()} tone, ${prompt}`;
    }

    if (!chat) throw new Error("Chat not initialized");
    
    return await chat.sendMessage({ message: prompt });
};

export const analyzeRemittance = async (remittanceText: string, workflows: Workflow[]) => {
     if (!process.env.API_KEY) {
        return { text: JSON.stringify([{ clientName: "Error: API Key not configured", invoiceId: "N/A", amountPaid: 0, workflowId: null, status: "unmatched" }]), functionCalls: [] } as unknown as GenerateContentResponse;
    }
    const prompt = `
Analyze the following remittance advice text. For each payment mentioned, extract the client name, the invoice reference/ID, and the amount paid. 
Then, match each payment to an outstanding invoice from the provided list of workflows.

A workflow is "matched" if the invoice ID and client name are found and the amount is correct.
If the invoice ID is found but the client is different or the amount is a partial payment, mark as "partial".
If no matching invoice can be found, mark as "unmatched".

Return the result as a JSON array of objects.

Remittance Text:
---
${remittanceText}
---

Outstanding Workflows for matching:
---
${JSON.stringify(workflows.filter(w => w.status !== 'Completed').map(w => ({
    workflowId: w.id,
    clientName: w.clientName,
    invoiceId: w.externalId,
    amountDue: w.amount
})), null, 2)}
---
`;
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        clientName: { type: Type.STRING },
                        invoiceId: { type: Type.STRING },
                        amountPaid: { type: Type.NUMBER },
                        workflowId: { type: Type.STRING },
                        status: {
                            type: Type.STRING,
                            enum: ['matched', 'partial', 'unmatched'],
                        }
                    },
                    required: ['clientName', 'invoiceId', 'amountPaid', 'status']
                }
            }
        }
    });

    return response;
};
