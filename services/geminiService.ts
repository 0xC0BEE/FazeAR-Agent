
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { Workflow, DunningPlan, User, ChatMessage } from '../types';

// IMPORTANT: In a real-world scenario, this API call should be made from a secure backend server.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const generateContentWithRetry = async (
    params: any, 
    retries = 3, 
    delay = 1000
): Promise<GenerateContentResponse> => {
    try {
        // Fix: Use ai.models.generateContent to call the Gemini API.
        const response = await ai.models.generateContent(params);
        return response;
    } catch (error) {
        if (retries > 0) {
            console.warn(`API call failed, retrying in ${delay}ms...`, error);
            await new Promise(res => setTimeout(res, delay));
            return generateContentWithRetry(params, retries - 1, delay * 2);
        } else {
            console.error("API call failed after multiple retries:", error);
            throw error;
        }
    }
};

const getBaseSystemInstruction = (
    workflows: Workflow[],
    currentUser: User,
    dunningPlans: DunningPlan[]
): string => {
    return `You are FazeAR, an expert AI assistant for Accounts Receivable (AR) management.
Your role is to help AR collectors, managers, and admins manage their workflows efficiently.
You are interacting with: ${currentUser.name} (${currentUser.role}).

Today's date is ${new Date().toLocaleDateString()}.

Available Dunning Plans:
${dunningPlans.map(p => `- ${p.name}: ${p.steps.map(s => `Day ${s.day} ${s.action}`).join(', ')}`).join('\n')}

Current Workflow Data:
You have access to a list of AR workflows. Here is a summary of the most relevant ones (overdue or recently active):
${workflows
    .filter(w => w.status !== 'Completed')
    .slice(0, 10) // Limit context size
    .map(w => `- ${w.clientName}: $${w.amount}, Due: ${w.dueDate}, Status: ${w.status}, Assignee: ${w.assignee}`)
    .join('\n')}
---
`;
};

export const runChatQuery = async (
    history: ChatMessage[],
    workflows: Workflow[],
    currentUser: User,
    dunningPlans: DunningPlan[]
): Promise<GenerateContentResponse> => {
    const systemInstruction = getBaseSystemInstruction(workflows, currentUser, dunningPlans) + 
    `The user is asking a question in the chat interface. Provide a helpful, concise, and professional response based on the provided data and the conversation history.
    If you are asked to perform an action (like drafting an email), provide the text for the action but state clearly that you cannot perform the action yourself.
    Analyze the user's query and the data, and respond naturally. If asked for a summary or report, present it clearly.`;

    const contents = history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user', // Gemini API uses 'user' and 'model'
        parts: [{ text: msg.content }]
    }));

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response;
    } catch (error) {
        console.error("Error running chat query:", error);
        const mockResponse: GenerateContentResponse = {
            // Fix: Access text directly from the response object.
            text: "Sorry, I encountered an error. Please try again.",
            candidates: [],
        };
        return mockResponse;
    }
};


export const getNextActionSuggestion = async (
    workflow: Workflow,
    dunningPlans: DunningPlan[]
): Promise<GenerateContentResponse> => {
    const systemInstruction = `You are an AR assistant. Your task is to analyze a single workflow and suggest the next best action based on its dunning plan and current status. Be concise and action-oriented.`;
    
    const prompt = `Workflow for ${workflow.clientName}:
- Amount: $${workflow.amount}
- Due Date: ${workflow.dueDate}
- Status: ${workflow.status}
- Dunning Plan: ${workflow.dunningPlanName}
- Communication History: ${workflow.communicationHistory.map(c => c.stepName).join(', ') || 'None'}
- Notes: ${workflow.notes.map(n => n.content).join('; ') || 'None'}

Based on the dunning plan and the workflow's state, what is the next recommended action?`;

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response;
    } catch (error) {
        console.error("Error getting next action suggestion:", error);
        const mockResponse: GenerateContentResponse = {
            text: "Could not determine next action.",
            candidates: [],
        };
        return mockResponse;
    }
};

export const draftEmail = async (
    workflow: Workflow,
    templateName: string
): Promise<GenerateContentResponse> => {
     const systemInstruction = `You are an expert AR collections agent. Your task is to draft a professional and effective collections email.
The email should be firm but polite. Include all relevant details.
The payment link is: ${workflow.paymentUrl}`;

    const prompt = `Draft an email for the "${templateName}" template.
Client: ${workflow.clientName}
Amount Due: $${workflow.amount.toLocaleString()}
Due Date: ${workflow.dueDate}

Personalize the email based on the client and amount. Make it ready to send.`;

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response;
    } catch (error) {
        console.error("Error drafting email:", error);
        const mockResponse: GenerateContentResponse = {
            text: `Failed to draft email for template: ${templateName}`,
            candidates: [],
        };
        return mockResponse;
    }
};

export const analyzeCashApplication = async (
  remittanceInfo: string
): Promise<GenerateContentResponse> => {
  const systemInstruction = `You are an AI assistant specializing in cash application for Accounts Receivable.
Your task is to parse remittance information and return structured data for matching payments to invoices.
The response MUST be a JSON array of objects.
Each object should represent a payment and contain 'clientName', 'invoiceId', and 'amountPaid'.`;

  const prompt = `Here is the remittance information from a bank statement or customer email. Please parse it and return the data in the specified JSON format.
---
${remittanceInfo}
---
`;

  try {
    const response = await generateContentWithRetry({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              clientName: {
                type: Type.STRING,
                description: "The name of the client who made the payment.",
              },
              invoiceId: {
                type: Type.STRING,
                description: "The invoice ID or reference number being paid.",
              },
              amountPaid: {
                type: Type.NUMBER,
                description: "The amount paid for that specific invoice.",
              },
            },
            required: ["clientName", "invoiceId", "amountPaid"],
          },
        },
      },
    });
    return response;
  } catch (error) {
    console.error("Error analyzing cash application data:", error);
    const mockResponse: GenerateContentResponse = {
        text: "[]",
        candidates: [],
    };
    return mockResponse;
  }
};
