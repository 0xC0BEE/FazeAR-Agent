// Fix: Removed non-exported member `LiveSession`. The return type of startLiveConversation is now inferred.
import { GoogleGenAI, FunctionDeclaration, Type, GenerateContentResponse, Modality, Blob } from '@google/genai';
import type { ChatMessage, Workflow, Tone, Match, Settings, User, ResolutionSuggestion } from '../types.ts';

let ai: GoogleGenAI | null = null;

export const initializeAi = (apiKey: string) => {
    ai = new GoogleGenAI({ apiKey });
};

const assignWorkflow: FunctionDeclaration = {
    name: 'assign_workflow',
    description: 'Assigns a workflow (invoice) for a specific client to a user.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            clientName: {
                type: Type.STRING,
                description: 'The name of the client associated with the workflow to be assigned.'
            },
            assigneeName: {
                type: Type.STRING,
                description: 'The name of the user to whom the workflow should be assigned.'
            }
        },
        required: ['clientName', 'assigneeName']
    }
};

const addNoteToWorkflow: FunctionDeclaration = {
    name: 'add_note_to_workflow',
    description: 'Adds a note to a workflow for a specific client.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            clientName: {
                type: Type.STRING,
                description: 'The name of the client to whose workflow the note will be added.'
            },
            note: {
                type: Type.STRING,
                description: 'The content of the note to be added.'
            }
        },
        required: ['clientName', 'note']
    }
};

const disputeInvoice: FunctionDeclaration = {
    name: 'dispute_invoice',
    description: 'Marks an invoice for a client as disputed and provides a reason.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            clientName: {
                type: Type.STRING,
                description: 'The name of the client whose invoice is being disputed.'
            },
            reason: {
                type: Type.STRING,
                description: 'The reason for the dispute.'
            }
        },
        required: ['clientName', 'reason']
    }
}

const viewInvoice: FunctionDeclaration = {
    name: 'view_invoice',
    description: 'Displays the detailed invoice for a specific client.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            clientName: {
                type: Type.STRING,
                description: 'The name of the client whose invoice should be displayed.'
            }
        },
        required: ['clientName']
    }
};

const functionDeclarations = [assignWorkflow, addNoteToWorkflow, disputeInvoice, viewInvoice];

export const generateChatResponse = async (
    prompt: string, 
    tone: Tone,
    workflows: Workflow[]
) : Promise<{ text: string | null, toolCall: { name: string, args: any } | null }> => {
    if (!ai) throw new Error("AI service not initialized. Please provide an API key.");
    
    const systemInstruction = `You are an AI assistant for an accounts receivable platform called FazeAR. Your purpose is to help collectors manage workflows, communicate with clients, and analyze data.
    - Today's date is ${new Date().toLocaleDateString()}.
    - When asked to draft communication, keep it concise and professional. The current tone preference is: ${tone}. Also fulfill general requests to draft content like emails.
    - You have access to a set of tools to perform actions. Use them when a user's request matches a tool's description.
    - Here is a summary of the current outstanding workflows: ${JSON.stringify(workflows.filter(w => w.status !== 'Completed').map(w => ({client: w.clientName, amount: w.amount, due: w.dueDate, status: w.status, assignee: w.assignee})))}. Do not list this data unless asked. Use it for context.
    - When a tool call is made, do not add any conversational text.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { role: 'user', parts: [{ text: prompt }] },
            config: {
                systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
                tools: [{ functionDeclarations }]
            }
        });
        
        let toolCall: { name: string, args: any } | null = null;
        if (response.functionCalls && response.functionCalls.length > 0) {
            toolCall = {
                name: response.functionCalls[0].name,
                args: response.functionCalls[0].args,
            }
        }
        
        return { text: response.text || null, toolCall };

    } catch (error) {
        console.error('Error generating chat response:', error);
        return { text: "I'm sorry, I encountered an error while processing your request.", toolCall: null };
    }
};

export const analyzeRemittanceAdvice = async (text: string, workflows: Workflow[]): Promise<Match[]> => {
    if (!ai) throw new Error("AI service not initialized. Please provide an API key.");
    const prompt = `
        Analyze the following remittance advice text. For each payment mentioned, extract the client name or identifier, the invoice number or reference, and the amount paid.
        Then, match each payment to one of the provided open workflows. 
        A successful match requires the invoice ID to be present in the workflow's externalId and the amount to be identical.
        If the amount is different, it's a partial match. If no workflow is found, it's unmatched.
        
        Remittance Text:
        ---
        ${text}
        ---
        
        Open Workflows:
        ---
        ${JSON.stringify(workflows.filter(w => w.status !== 'Completed').map(w => ({ workflowId: w.id, clientName: w.clientName, externalId: w.externalId, amount: w.amount })))}
        ---
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        clientName: { type: Type.STRING },
                        invoiceId: { type: Type.STRING },
                        amountPaid: { type: Type.NUMBER },
                        workflowId: { type: Type.STRING, nullable: true },
                        status: { type: Type.STRING, enum: ['matched', 'partial', 'unmatched'] },
                    },
                    required: ["clientName", "invoiceId", "amountPaid", "status"]
                }
            }
        }
    });

    try {
        const jsonText = response.text.trim();
        const matches = JSON.parse(jsonText) as Match[];
        return matches;
    } catch (e) {
        console.error("Failed to parse JSON response for remittance advice", e);
        throw new Error("Could not analyze remittance advice.");
    }
};

export const runAnalyticsQuery = async (prompt: string, workflows: Workflow[], users: User[]): Promise<string> => {
    if (!ai) throw new Error("AI service not initialized. Please provide an API key.");
    const systemInstruction = `You are a data analyst for an AR platform. Answer the user's question based on the provided JSON data for workflows and users. Provide a concise, text-based answer.
    
    Workflows Data: ${JSON.stringify(workflows)}
    Users Data: ${JSON.stringify(users.filter(u => u.role !== 'Client'))}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            systemInstruction,
        }
    });

    return response.text;
};


export const generateWhatIfScenario = async (prompt: string, originalWorkflows: Workflow[]): Promise<Workflow[]> => {
    if (!ai) throw new Error("AI service not initialized. Please provide an API key.");
    const systemInstruction = `You are a financial planning AI. The user will provide a "what-if" scenario. Your task is to modify the provided list of workflows according to the scenario and return ONLY the modified list of workflows as a valid JSON array. Do not include any other text or explanations.
    
    Original Workflows: ${JSON.stringify(originalWorkflows)}
    `;

    // Create a deep copy to avoid mutating original state
    let scenarioWorkflows = JSON.parse(JSON.stringify(originalWorkflows)) as Workflow[];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        clientName: { type: Type.STRING },
                        amount: { type: Type.NUMBER },
                        dueDate: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                        status: { type: Type.STRING, enum: ['Overdue', 'In Progress', 'Completed'] },
                        assignee: { type: Type.STRING },
                        isAutonomous: { type: Type.BOOLEAN },
                        externalId: { type: Type.STRING },
                        auditTrail: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                        communications: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                        dunningPlanId: { type: Type.STRING, nullable: true },
                        disputeStatus: { type: Type.STRING, nullable: true },
                        disputeReason: { type: Type.STRING, nullable: true },
                        createdDate: { type: Type.STRING },
                        paymentDate: { type: Type.STRING, nullable: true },
                        items: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                    }
                }
            }
        }
    });

    try {
        const jsonText = response.text.trim();
        const updatedWorkflows = JSON.parse(jsonText) as Workflow[];
        return updatedWorkflows;
    } catch (e) {
        console.error("Failed to parse JSON response for what-if scenario", e);
        // Return original workflows on failure
        return originalWorkflows;
    }
};

export const startLiveConversation = async (
    workflow: Workflow,
    callbacks: {
        onMessage: (message: any) => void,
        onError: (error: any) => void,
        onClose: () => void,
    }
) => {
    if (!ai) throw new Error("AI service not initialized. Please provide an API key.");
    
    const systemInstruction = `You are an accounts payable representative for ${workflow.clientName}. Your name is Alex. You are discussing invoice #${workflow.externalId} for $${workflow.amount}, which was due on ${workflow.dueDate}. Be professional and courteous, but you can be firm about payment schedules if pressed. You are aware of the invoice details but may need to ask for clarification. Do not break character.`;

    const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => {},
            onmessage: callbacks.onMessage,
            onerror: callbacks.onError,
            onclose: callbacks.onClose,
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
    });
    
    return session;
}

export const summarizeConversation = async (transcript: string): Promise<string> => {
    if (!ai) throw new Error("AI service not initialized. Please provide an API key.");
    
    const prompt = `Please summarize the following conversation transcript from an accounts receivable call. Extract key outcomes such as promises to pay (including dates and amounts), any disputes raised, or required follow-up actions. The summary should be concise and formatted for an internal note.

    Transcript:
    ---
    ${transcript}
    ---
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
};

export const getDisputeResolutionSuggestions = async (workflow: Workflow): Promise<ResolutionSuggestion> => {
    if (!ai) throw new Error("AI service not initialized. Please provide an API key.");
    
    const prompt = `
        You are an AI assistant for an Accounts Receivable specialist. Analyze the following disputed invoice and provide a concise summary and 3 actionable suggestions for resolution.

        Disputed Workflow Details:
        - Client: ${workflow.clientName}
        - Invoice ID: ${workflow.externalId}
        - Amount: $${workflow.amount}
        - Due Date: ${workflow.dueDate}
        - Initial Dispute Reason: "${workflow.disputeReason}"
        - Communication History: ${JSON.stringify(workflow.communications)}
        - Audit Trail: ${JSON.stringify(workflow.auditTrail.slice(-3))}

        Based on this information, provide a brief summary of the situation. Then, provide exactly three distinct, actionable suggestions a collector could take. For each suggestion, provide a 'title' (a short summary of the action) and a 'prompt' (a detailed instruction for an AI to execute, like drafting a specific email).
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    prompt: { type: Type.STRING }
                                },
                                required: ["title", "prompt"]
                            }
                        }
                    },
                    required: ["summary", "suggestions"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ResolutionSuggestion;

    } catch (error) {
        console.error("Failed to get dispute suggestions:", error);
        return { summary: "Could not analyze the dispute. Please review manually.", suggestions: [] };
    }
};