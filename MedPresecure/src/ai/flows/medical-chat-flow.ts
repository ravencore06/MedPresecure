'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MessageSchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});

const MedicalChatInputSchema = z.object({
    history: z.array(MessageSchema),
    question: z.string(),
});

export type MedicalChatInput = z.infer<typeof MedicalChatInputSchema>;

const MedicalChatOutputSchema = z.object({
    response: z.string(),
});


const MEDICAL_SYSTEM_PROMPT = `You are a helpful and cautious AI medical assistant. 
Your goal is to provide general health information and guidance based on user queries.

**CRITICAL SAFETY GUIDELINES:**
1.  **DO NOT provide medical diagnoses.** If a user asks "Do I have X?", explain that you cannot diagnose but you can provide information about X.
2.  **Disclaimer:** Always remind the user that your advice is for informational purposes only and they should consult a doctor for personal medical advice.
3.  **Emergency:** If the user describes severe symptoms (chest pain, difficulty breathing, severe bleeding, etc.), immediately advise them to call emergency services or go to the nearest hospital.
4.  **Tone:** Be empathetic, professional, and clear. Use simple language.
5.  **Format:** Use Markdown for readability use bullet points/bold text where appropriate.

Answer the user's latest question based on the conversation history provided.`;

export const medicalChatFlow = ai.defineFlow(
    {
        name: 'medicalChatFlow',
        inputSchema: MedicalChatInputSchema,
        outputSchema: MedicalChatOutputSchema,
    },
    async (input) => {
        const { history, question } = input;

        // Construct the full prompt context
        const conversationContext = history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
        const fullPrompt = `${MEDICAL_SYSTEM_PROMPT}\n\nConversation History:\n${conversationContext}\n\nUser: ${question}\nAssistant:`;

        // Use the model defined in genkit.ts (usually exported or implicitly available via 'ai' instance if configured correctly)
        // Wait, the 'ai' instance from '@/ai/genkit' is likely just the configured Genkit instance.
        // We need to use generate() from the instance.

        const response = await ai.generate({
            prompt: fullPrompt,
            config: {
                temperature: 0.7, // Encourages creative yet safer responses
            }
        });

        return { response: response.text };
    }
);

export async function submitMedicalQuery(history: { role: 'user' | 'model', content: string }[], question: string) {
    try {
        const result = await medicalChatFlow({
            history,
            question
        });
        return result.response;
    } catch (error: any) {
        console.error("Medical Chat Error:", error);
        return "I apologize, but I'm currently unable to process your request. Please try again later.";
    }
}
