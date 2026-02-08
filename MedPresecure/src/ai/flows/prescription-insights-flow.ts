'use server';
/**
 * @fileOverview A prescription insights AI agent.
 *
 * - analyzePrescription - A function that handles the prescription analysis process.
 * - PrescriptionInsightsInput - The input type for the analyzePrescription function.
 * - PrescriptionInsightsOutput - The return type for the analyzePrescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const PrescriptionInsightsInputSchema = z.object({
  medicineName: z.string().describe('The name of the prescribed medicine.'),
  dosage: z.string().describe('The dosage of the medicine.'),
  frequency: z.string().describe('The frequency of medicine intake (e.g., twice daily).'),
  notes: z.string().optional().describe('Additional notes from the doctor.'),
  patientInfo: z.object({
    age: z.number().optional().describe('Patient\'s age.'),
    gender: z.string().optional().describe('Patient\'s gender.'),
  }).optional(),
  pastPrescriptions: z.array(z.object({
      medicineName: z.string(),
      dosage: z.string(),
      startDate: z.string(),
  })).optional().describe('Patient\'s past prescription history.'),
});

export type PrescriptionInsightsInput = z.infer<typeof PrescriptionInsightsInputSchema>;

const PrescriptionInsightsOutputSchema = z.object({
  medicinePurpose: z.string().describe('A simple, patient-friendly explanation of the medicine’s purpose.'),
  intakeSchedule: z.string().describe('A clear daily intake schedule in plain language.'),
  commonSideEffects: z.array(z.string()).describe('A list of common, non-alarming side effects for educational purposes.'),
  alerts: z.array(z.object({
    level: z.enum(['Low', 'Medium']).describe('The attention level of the alert.'),
    message: z.string().describe('The content of the alert (e.g., "Repeated antibiotic use detected").'),
  })).describe('Highlighted alerts for potential issues like duplicate medicines or long-term usage.'),
  followUpSuggestions: z.array(z.string()).describe('A list of suggestions for follow-up actions (e.g., "Consult your doctor if symptoms persist").'),
});

export type PrescriptionInsightsOutput = z.infer<typeof PrescriptionInsightsOutputSchema>;

export async function analyzePrescription(input: PrescriptionInsightsInput): Promise<PrescriptionInsightsOutput> {
  return prescriptionInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prescriptionInsightsPrompt',
  input: {schema: PrescriptionInsightsInputSchema},
  output: {schema: PrescriptionInsightsOutputSchema},
  prompt: `You are an AI-powered clinical insights assistant. Your purpose is to analyze digitized medical prescriptions to extract structured information and generate safe, explainable, and non-diagnostic insights.

  **Safety & Compliance Rules (CRITICAL):**
  1.  **DO NOT** provide medical diagnosis or treatment recommendations.
  2.  **DO NOT** replace a licensed healthcare professional. Your insights are informational only.
  3.  Use neutral, calm, and cautious language at all times.
  4.  Explicitly state that insights are for informational purposes.
  5.  Respect patient privacy.

  **Input Data:**
  - Medicine Name: {{{medicineName}}}
  - Dosage: {{{dosage}}}
  - Frequency: {{{frequency}}}
  {{#if notes}}- Doctor's Notes: {{{notes}}}{{/if}}
  {{#if patientInfo}}- Patient Info: Age {{{patientInfo.age}}}, Gender {{{patientInfo.gender}}}{{/if}}
  {{#if pastPrescriptions}}
  - Past Prescriptions:
  {{#each pastPrescriptions}}
    - {{this.medicineName}} ({{this.dosage}}), started on {{this.startDate}}
  {{/each}}
  {{/if}}

  **Your Task:**
  Based on the data provided, generate the following insights in the specified JSON format.
  
  - **medicinePurpose**: Explain the medicine's purpose in simple terms.
  - **intakeSchedule**: Create a clear, plain-language daily schedule.
  - **commonSideEffects**: List a few common, non-alarming side effects. Frame this as educational information.
  - **alerts**: Identify potential issues like duplicate medicines, repeated antibiotic use, or long-term medication use. Assign a 'Low' or 'Medium' attention level.
  - **followUpSuggestions**: Suggest actions like consulting a doctor if symptoms persist.
  `,
});

const prescriptionInsightsFlow = ai.defineFlow(
  {
    name: 'prescriptionInsightsFlow',
    inputSchema: PrescriptionInsightsInputSchema,
    outputSchema: PrescriptionInsightsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate prescription insights.');
    }
    return output;
  }
);
