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
    // This is the publicly hosted URL for the image.
    const imageUrl = 'https://i.imgur.com/pY12x8x.jpeg';

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; padding: 20px;">
        <div style="text-align: center;">
          <h1 style="color: #B76E58; font-size: 28px;">Thank You for your RSVP, ${name}!</h1>
        </div>
        <div style="margin-top: 20px; text-align: center;">
          <p style="font-size: 16px; color: #0F4D38;">
            We are so excited to celebrate with you! Your confirmation has been received.
          </p>
          <p style="font-size: 16px; color: #0F4D38;">
            Here is a copy of our wedding invitation for your convenience.
          </p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <img 
            src="${imageUrl}" 
            alt="Wedding Invitation" 
            style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" 
          />
        </div>
        <div style="margin-top: 30px; text-align: center; font-size: 14px; color: #555;">
          <p>With love,</p>
          <p style="font-size: 24px; color: #B76E58; margin-top: 5px;">Deborah & Benjamin</p>
        </div>
      </div>
    `;

    console.log('--- Sending RSVP Confirmation Email ---');
    console.log(`To: ${email}`);
    console.log(`Subject: You're Invited! Confirmation for Deborah & Benjamin's Wedding`);
    console.log('Body:');
    console.log(emailHtml);
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
  },
  async (input) => {
    const success = await sendConfirmationEmail(input);
    return { success };
  }
);
