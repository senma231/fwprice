'use server';
/**
 * @fileOverview Handles submission of RFQ (Request for Quotation) forms.
 *
 * - submitRfq - A function that processes the RFQ submission.
 * - RfqInput - The input type for the submitRfq function.
 * - RfqOutput - The return type for the submitRfq function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RfqInputSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  company: z.string().optional(),
  origin: z.string().min(1, "Origin is required."),
  destination: z.string().min(1, "Destination is required."),
  weight: z.number().positive().optional(),
  freightType: z.enum(["sea", "air", "land", ""]).optional(),
  message: z.string().optional(),
});
export type RfqInput = z.infer<typeof RfqInputSchema>;

const RfqOutputSchema = z.object({
  message: z.string(),
  submissionId: z.string(),
});
export type RfqOutput = z.infer<typeof RfqOutputSchema>;

// This is the exported function that the UI will call.
export async function submitRfq(input: RfqInput): Promise<RfqOutput> {
  return rfqSubmissionFlow(input);
}

const rfqSubmissionFlow = ai.defineFlow(
  {
    name: 'rfqSubmissionFlow',
    inputSchema: RfqInputSchema,
    outputSchema: RfqOutputSchema,
  },
  async (input) => {
    console.log('New RFQ Submission Received:');
    console.log(JSON.stringify(input, null, 2));

    // In a real application, this flow would:
    // 1. Save the RFQ to a database.
    // 2. Notify the sales team (e.g., via email, CRM integration, or a messaging platform).
    // 3. Optionally, perform initial AI-based processing like categorization or urgency assessment.
    // For this demo, we are just logging it and returning a success message.

    const submissionId = `RFQ-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Simulate a short delay as if processing something
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      message: `Thank you for your inquiry, ${input.name}! Your request (ID: ${submissionId}) has been received. Our sales team will review your details and contact you shortly with a personalized quote.`,
      submissionId: submissionId,
    };
  }
);

