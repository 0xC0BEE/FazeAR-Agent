
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { Draft, Workflow, User } from '../types';

// Per instructions, initialize with API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

// This is a simplified context builder. A real app might have a more complex one.
const buildContext = (workflows: Workflow[], users: User[], selectedWorkflow: Workflow | null): string => {
    let context = `
        Here is the current state of the Accounts Receivable system.
        Users: ${JSON.stringify(users.map(u => ({ name: u.name, role: u.role })))}
        All Workflows: ${JSON.stringify(workflows.map(w => ({ client: w.clientName, amount: w.amount, status: w.status, assignee: w.assignee, due: w.dueDate })))}
    `;
    if (selectedWorkflow) {
        context += `\nCurrently Selected Workflow: ${JSON.stringify(selectedWorkflow)}`;
    }
    return context;
};

export const getAnalyticsInsight = async (prompt: string, workflows: Workflow[], users: User[]): Promise<string> => {
    const context = buildContext(workflows, users, null);
    const fullPrompt = `
        Context:
        ${context}

        User Query: "${prompt}"

        Based on the provided context, answer the user's query. Provide a concise, data-driven answer.
        If the query is about performance, use the data to back it up.
        If the query is a summary request, provide a clear summary.
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: fullPrompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting analytics insight:", error);
        return "Sorry, I encountered an error while analyzing the data.";
    }
};

const emailDraftSchema = {
    type: Type.OBJECT,
    properties: {
        recipient: { type: Type.STRING, description: 'The email address of the client contact.' },
        subject: { type: Type.STRING, description: 'The subject line of the email.' },
        body: { type: Type.STRING, description: 'The body of the email. It should be professional, courteous, and clear. It should reference the invoice amount and due date.' }
    },
    required: ['recipient', 'subject', 'body'],
};

export const generateEmailDraft = async (workflow: Workflow): Promise<Omit<Draft, 'type' | 'workflowId'>> => {
    const prompt = `
        Generate a professional reminder email for the following invoice.
        The client is ${workflow.clientName}.
        The invoice amount is $${workflow.amount}.
        The due date was ${workflow.dueDate}.
        The current status is ${workflow.status}.
        The tone should be firm but professional if overdue, and a gentle reminder if it is still in progress.
        The recipient is "client.contact@${workflow.clientName.toLowerCase().replace(/\s/g, '')}.com".
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: emailDraftSchema,
            }
        });

        // According to docs, response.text will be a JSON string.
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return parsed;

    } catch (error) {
        console.error("Error generating email draft:", error);
        return {
            recipient: `client.contact@${workflow.clientName.toLowerCase().replace(/\s/g, '')}.com`,
            subject: `Error Generating Draft`,
            body: `Could not generate an email draft for ${workflow.clientName}. Please write one manually.`
        };
    }
};


export const adjustEmailDraftTone = async (draft: Draft, instruction: string): Promise<Omit<Draft, 'type' | 'workflowId'>> => {
    const prompt = `
        Adjust the tone of the following email draft based on the user's instruction.
        
        Instruction: "${instruction}"

        Original Draft:
        Subject: ${draft.subject}
        Body: ${draft.body}

        Return ONLY the adjusted JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: emailDraftSchema,
            }
        });
        
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return parsed;

    } catch (error) {
        console.error("Error adjusting email draft tone:", error);
        return {
            recipient: draft.recipient,
            subject: `Error Adjusting Draft`,
            body: `Could not adjust the draft. Please edit manually.\n\n---\n${draft.body}`
        };
    }
};
