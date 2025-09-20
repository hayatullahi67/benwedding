'use server';

/**
 * @fileOverview This file defines a Genkit flow for sending an RSVP confirmation email.
 *
 * - `sendRsvpConfirmation`: A function that sends a confirmation email to a guest.
 * - `RsvpConfirmationInput`: The input type for the sendRsvpConfirmation function.
 * - `RsvpConfirmationOutput`: The output type for the sendRsvpConfirmation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RsvpConfirmationInputSchema = z.object({
  email: z.string().email().describe('The email address of the guest.'),
  name: z.string().describe('The name of the guest.'),
});
export type RsvpConfirmationInput = z.infer<typeof RsvpConfirmationInputSchema>;

const RsvpConfirmationOutputSchema = z.object({
  success: z.boolean().describe('Indicates whether the email was sent successfully.'),
});
export type RsvpConfirmationOutput = z.infer<typeof RsvpConfirmationOutputSchema>;

export async function sendRsvpConfirmation(input: RsvpConfirmationInput): Promise<RsvpConfirmationOutput> {
  return sendRsvpConfirmationFlow(input);
}

// In a real application, you would use an email service like Resend or SendGrid.
// For this prototype, we will simulate sending an email by logging to the console.
const sendConfirmationEmail = ai.defineTool(
  {
    name: 'sendConfirmationEmail',
    description: 'Sends an RSVP confirmation email to a guest with an invitation image.',
    inputSchema: z.object({
      email: z.string().email().describe('The email address of the guest.'),
      name: z.string().describe('The name of the guest.'),
    }),
    outputSchema: z.boolean().describe('Indicates whether the email was sent successfully.'),
  },
  async ({ email, name }) => {
    console.log('--- Sending RSVP Confirmation Email ---');
    console.log(`To: ${email}`);
    console.log(`Subject: You're Invited! Confirmation for Deborah & Benjamin's Wedding`);
    console.log(`Body:`);
    console.log(`Dear ${name},`);
    console.log(`Thank you for your RSVP! We are so excited to celebrate with you.`);
    console.log(`Please see the attached invitation for details.`);
    console.log(`Image: /images/benwedding.jpg`);
    console.log('------------------------------------');
    // Simulate a successful email send
    return true;
  }
);

const sendRsvpConfirmationFlow = ai.defineFlow(
  {
    name: 'sendRsvpConfirmationFlow',
    inputSchema: RsvpConfirmationInputSchema,
    outputSchema: RsvpConfirmationOutputSchema,
    tools: [sendConfirmationEmail],
  },
  async (input) => {
    const success = await sendConfirmationEmail(input);
    return { success };
  }
);
