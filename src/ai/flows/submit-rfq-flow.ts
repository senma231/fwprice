
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
import { saveRfqSubmission } from '@/lib/dataService'; // Import function to save RFQ (updated path)

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
  output: { schema: RfqOutputSchema }, // The prompt itself will only generate the 'message' part.
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
3. Mentions that a unique submission ID will be provided to them by our system (do not generate it yourself).
4. Assures them that the sales team will review their details and contact them shortly with a personalized, preferential quote.
5. If they mentioned specific details like weight or freight type, briefly acknowledge that those have been noted.
6. Keep the tone positive and reassuring.
7. Reiterate that a sales representative will contact them to discuss potential preferential pricing.

Return ONLY the generated confirmation message text. The submission ID will be handled by the system.
Your response should be just the message string.
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

    // Save the RFQ to our database
    try {
      await saveRfqSubmission(input, submissionId); // Updated call
      console.log(`RFQ ${submissionId} saved to database.`);
    } catch (error) {
      console.error(`Failed to save RFQ ${submissionId} to database:`, error);
      // Decide if this is a critical failure or if we should proceed with notifying the user
      // For now, rethrow to indicate failure to the client.
      throw new Error(`Failed to save RFQ: ${ (error as Error).message }`);
    }

    // Call the AI prompt to generate the confirmation message
    const { output: aiGeneratedContent } = await rfqConfirmationPrompt(input);

    let confirmationMessage: string;

    if (aiGeneratedContent && aiGeneratedContent.message) {
      confirmationMessage = typeof aiGeneratedContent.message === 'string' ? aiGeneratedContent.message : (aiGeneratedContent as unknown as string);
      if (!confirmationMessage.includes(submissionId)) {
         confirmationMessage = `${confirmationMessage} Your submission ID is ${submissionId}.`;
      }
    } else if (typeof aiGeneratedContent === 'string') {
        confirmationMessage = aiGeneratedContent;
        if (!confirmationMessage.includes(submissionId)) {
           confirmationMessage = `${confirmationMessage} Your submission ID is ${submissionId}.`;
        }
    }
    else {
      console.error('AI failed to generate RFQ confirmation message or returned unexpected format. Using fallback.');
      confirmationMessage = `Thank you for your inquiry, ${input.name}! Your request (ID: ${submissionId}) has been received. Our sales team will review your details and contact you shortly with a personalized, preferential quote. We have noted your shipment from ${input.origin} to ${input.destination}. A sales representative will be in touch soon to discuss potential preferential pricing.`;
    }
    
    return {
      message: confirmationMessage,
      submissionId: submissionId,
    };
  }
);
