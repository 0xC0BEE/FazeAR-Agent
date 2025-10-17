import { GoogleGenAI, Type, GenerateContentResponse, Content, FunctionDeclaration } from "@google/genai";
import type { ChatMessage } from '../types.ts';

// Initialize the AI client at the top level for platform compatibility.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const tools: FunctionDeclaration[] = [
  {
    name: 'assign_workflow',
    description: 'Assigns or reassigns a workflow to a specific collector. Use when the user asks to assign, reassign, or give a task to someone.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        workflowIdentifier: {
          type: Type.STRING,
          description: "The client name or a unique invoice ID (e.g., 'inv_1234') of the workflow to assign."
        },
        assigneeName: {
          type: Type.STRING,
          description: "The full name of the collector to assign the workflow to (e.g., 'Sarah Lee')."
        }
      },
      required: ['workflowIdentifier', 'assigneeName']
    }
  },
  {
    name: 'add_note_to_workflow',
    description: "Adds a note or logs an activity to a specific workflow's audit trail. Use this to record information, updates, or actions taken.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        workflowIdentifier: {
          type: Type.STRING,
          description: "The client name or a unique invoice ID (e.g., 'inv_1234') of the workflow to add the note to."
        },
        note: {
          type: Type.STRING,
          description: "The content of the note to add."
        }
      },
      required: ['workflowIdentifier', 'note']
    }
  },
  {
    name: 'send_reminder',
    description: "Sends a payment reminder for a specific workflow. This action logs that a reminder was sent in the workflow's audit trail.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        workflowIdentifier: {
          type: Type.STRING,
          description: "The client name or a unique invoice ID (e.g., 'inv_1234') of the workflow to send a reminder for."
        },
      },
      required: ['workflowIdentifier']
    }
  }
];

export const runChat = async (messages: ChatMessage[]): Promise<GenerateContentResponse> => {
  const geminiHistory: Content[] = messages
    .filter(m => !m.isThinking)
    // Fix: Add explicit 'Content | null' return type to the map function to satisfy the type predicate in the following filter.
    .map((msg): Content | null => {
        if (msg.role === 'user') {
            return { role: 'user', parts: [{ text: msg.content || '' }] };
        }
        if (msg.role === 'model') {
            if (msg.content) return { role: 'model', parts: [{ text: msg.content }] };
            if (msg.toolCall) {
                const { id, ...rest } = msg.toolCall;
                return { role: 'model', parts: [{ functionCall: rest }]};
            }
        }
        if (msg.role === 'tool') {
            if (msg.toolResponse) {
                const { id, ...rest } = msg.toolResponse;
                return { role: 'tool', parts: [{ functionResponse: rest }] };
            }
        }
        return null;
    }).filter((m): m is Content => m !== null);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: geminiHistory,
    config: {
      tools: [{ functionDeclarations: tools }]
    }
  });

  return response;
};

/**
 * Analyzes remittance text to extract structured payment data.
 * @param remittanceText - The unstructured text from a bank statement or email.
 * @returns A GenerateContentResponse containing the parsed data in its text property.
 */
export const analyzeCashApplication = async (remittanceText: string): Promise<GenerateContentResponse> => {
    const prompt = `Analyze the following remittance text and extract the payment information into a structured JSON array. For each payment, provide the client's name, the invoice ID referenced, and the amount paid. Text: "${remittanceText}"`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        clientName: { 
                            type: Type.STRING, 
                            description: "The name of the client making the payment." 
                        },
                        invoiceId: { 
                            type: Type.STRING, 
                            description: "The invoice number or reference ID for the payment." 
                        },
                        amountPaid: { 
                            type: Type.NUMBER, 
                            description: "The amount of the payment." 
                        }
                    },
                    required: ["clientName", "invoiceId", "amountPaid"]
                }
            },
        }
    });
    
    return response;
};