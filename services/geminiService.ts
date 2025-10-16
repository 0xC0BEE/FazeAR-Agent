import { GoogleGenAI, Type, GenerateContentResponse, Content } from "@google/genai";
import { GEMINI_API_KEY } from '../apiKey.ts';
import type { ChatMessage, Workflow, User } from '../types.ts';

let ai: GoogleGenAI | null = null;

// Singleton client getter to lazy-initialize the AI client
const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
          // Remind the user to add their key if they haven't.
          // This now throws an error when an API call is made, not on app load.
          throw new Error("Please replace 'YOUR_API_KEY_HERE' with your actual Gemini API key in the apiKey.ts file.");
        }
        ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }
    return ai;
}

// This is a placeholder for a more complex chat implementation.
// For the current app, the main usage is analyzeCashApplication.
export const runChat = async (messages: ChatMessage[], workflows: Workflow[], users: User[]): Promise<GenerateContentResponse> => {
  const client = getAiClient();
  const lastUserMessage = messages[messages.length - 1].content || "";

  // A very basic router for demonstration. A full implementation would use tools.
  if (lastUserMessage.toLowerCase().includes('aging report')) {
     const text = "The aging report is available in the Analytics tab.";
     // Fix: Construct a valid GenerateContentResponse-like object for local handling.
     return { text } as GenerateContentResponse;
  }

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    // Fix: Correctly map ChatMessage to Gemini's Content type, filtering out tool-related roles not directly sent.
    contents: messages
      .filter(m => m.role === 'user' || m.role === 'model')
      .map(m => ({ role: m.role, parts: [{ text: m.content || "" }] }) as Content),
  });

  return response;
};

/**
 * Analyzes remittance text to extract structured payment data.
 * @param remittanceText - The unstructured text from a bank statement or email.
 * @returns A GenerateContentResponse containing the parsed data in its text property.
 */
export const analyzeCashApplication = async (remittanceText: string): Promise<GenerateContentResponse> => {
    const client = getAiClient();
    const prompt = `Analyze the following remittance text and extract the payment information into a structured JSON array. For each payment, provide the client's name, the invoice ID referenced, and the amount paid. Text: "${remittanceText}"`;

    const response = await client.models.generateContent({
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