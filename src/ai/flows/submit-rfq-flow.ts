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

const rfqConfirmationPrompt = ai.definePrompt({
  name: 'rfqConfirmationPrompt',
  input: { schema: RfqInputSchema },
  output: { schema: RfqOutputSchema },
  prompt: `You are a helpful sales assistant for FreightWise, a freight logistics company.
A potential customer has just submitted a Request for Quotation (RFQ).
Your task is to generate a friendly and professional confirmation message for them.

Customer Details:
Name: {{name}}
Email: {{email}}
{{#if company}}Company: {{company}}{{/if}}

Shipment Details:
Origin: {{origin}}
Destination: {{destination}}
{{#if weight}}Estimated Weight: {{weight}} kg{{/if}}
{{#if freightType}}Freight Type: {{freightType}}{{/if}}
{{#if message}}Additional Message: {{message}}{{/if}}

Generate a confirmation message that:
1. Thanks the customer by name for their inquiry.
2. Acknowledges receipt of their RFQ.
3. Mentions a unique submission ID (which will be provided to you).
4. Assures them that the sales team will review their details and contact them shortly with a personalized, preferential quote.
5. If they mentioned specific details like weight or freight type, briefly acknowledge that those have been noted.
6. Keep the tone positive and reassuring.
7. Reiterate that a sales representative will contact them to discuss potential preferential pricing.

Return the response in the format specified by the RfqOutputSchema. The 'message' field should contain your generated confirmation message. The 'submissionId' will be injected by the flow.
`,
});


const rfqSubmissionFlow = ai.defineFlow(
  {
    name: 'rfqSubmissionFlow',
    inputSchema: RfqInputSchema,
    outputSchema: RfqOutputSchema,
  },
  async (input) => {
    console.log('New RFQ Submission Received by AI Flow:');
    console.log(JSON.stringify(input, null, 2));

    const submissionId = `RFQ-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Call the AI prompt to generate the confirmation message
    const { output } = await rfqConfirmationPrompt(input);

    if (!output) {
      // Fallback message in case the AI fails to generate a response
      console.error('AI failed to generate RFQ confirmation message. Using fallback.');
      return {
        message: `Thank you for your inquiry, ${input.name}! Your request (ID: ${submissionId}) has been received. Our sales team will review your details and contact you shortly with a personalized, preferential quote. We have noted your shipment from ${input.origin} to ${input.destination}. A sales representative will be in touch soon to discuss potential preferential pricing.`,
        submissionId: submissionId,
      };
    }

    // The prompt itself doesn't know the submissionId, so we add it here.
    // The prompt is instructed to generate the message part, and the flow constructs the final output.
    return {
      message: output.message, // Use the AI-generated message
      submissionId: submissionId, // Add the generated submissionId
    };
  }
);
