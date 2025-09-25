
"use client";

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import emailjs from '@emailjs/browser';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const rsvpFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  attending: z.enum(["yes", "no"], { required_error: "Please select an option." }),
  name: z.string().optional(),
  phone: z.string().optional().refine(
    (val) => !val || val.length === 11,
    {
      message: "pls yr phone number is nit up to 11 pls complete it",
    }
  ),
  guests: z.string().optional(),
  relation: z.string().optional(),
  directions: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.attending === "yes") {
        if (!data.name || data.name.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["name"],
                message: "Your name must be at least 2 characters.",
            });
        }
        if (!data.guests) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["guests"],
                message: "Please select the number of guests.",
            });
        }
        if (!data.relation) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["relation"],
                message: "Please select your connection.",
            });
        }
        if (!data.directions) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["directions"],
                message: "Please let us know if you need directions.",
            });
        }
    }
});

type RsvpFormValues = z.infer<typeof rsvpFormSchema>;

export function RsvpForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<RsvpFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      attending: undefined,
      name: "",
      phone: "",
      guests: "",
      relation: "",
      directions: "",
    }
  });

  const watchAttending = form.watch("attending");

  async function onSubmit(data: RsvpFormValues) {
    setIsSubmitting(true);

    try {
        const rsvpsRef = collection(db, "rsvps");
        const q = query(rsvpsRef, where("email", "==", data.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            toast({
                variant: "destructive",
                title: "Already Registered",
                description: "This email address has already been used to RSVP.",
            });
            setIsSubmitting(false);
            return;
        }
        
        setSubmittedData(data);
    
        if (data.attending === 'no') {
            await addDoc(rsvpsRef, { ...data, createdAt: serverTimestamp() });
            setIsSubmitted(true);
            form.reset();
            return;
        }
    
        if (data.attending === "yes" && data.name && data.email) {

            const emailBody = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 40px; margin: 0;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #4A5568; color: #ffffff; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold;">You're Invited!</h1>
                </div>
                <div style="padding: 30px 40px; color: #2D3748;">
                  <p style="font-size: 18px; margin-bottom: 20px;">Dearest ${data.name},</p>
                  <p style="font-size: 16px; line-height: 1.6;">Thank you for confirming your attendance! We are absolutely thrilled to have you celebrate with us. Your presence will make our special day even more memorable. 💕</p>
                  <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;">
                  <h2 style="font-size: 22px; color: #2D3748; margin-bottom: 15px;">Event Details</h2>
                  <p style="font-size: 16px; margin: 10px 0;"><strong>📍 Venue:</strong> Agaya Hotel, Kwandere Road, Lafia</p>
                  <p style="font-size: 16px; margin: 10px 0;"><strong>🗓️ Date:</strong> November 1st, 2025</p>
                  <p style="font-size: 16px; margin: 10px 0;"><strong>⏰ Time:</strong> 4:00 PM</p>
                  <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;">
                  <h2 style="font-size: 22px; color: #2D3748; margin-bottom: 15px;">A Few Notes</h2>
                  <ul style="font-size: 16px; list-style-type: '✨'; padding-left: 20px; line-height: 1.8;">
                    <li>Please arrive 15-20 minutes early to settle in before the grand entrance.</li>
                    <li>Colors Of the Day: Metallic Brown, Burgundy, and Tan.</li>
                    <li>For any questions, feel free to reach us at: 08169536118.</li>
                  </ul>
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="https://benwedding.vercel.app/RSVP.pdf" download="Wedding_Invitation.pdf" style="background-color: #2D3748; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">Download Your Invitation</a>
                  </div>
                  <p style="font-size: 16px; text-align: center; line-height: 1.6;">We can’t wait to share the joy, laughter, food, music, and dance with you! 🎶💃🕺</p>
                </div>
                <div style="background-color: #f7fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="font-size: 16px; color: #718096; margin: 0;">With love and excitement,</p>
                  <p style="font-size: 20px; font-weight: bold; color: #2D3748; margin: 5px 0 0 0;">DeeWealth 💍</p>
                </div>
              </div>
            </div>
            `;

            const templateParams = {
                name: data.name,
                to_email: data.email,
                email_body: emailBody,
            };
          
            await emailjs.send(
              process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
              process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
              templateParams,
              process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
            );

            await addDoc(rsvpsRef, { ...data, createdAt: serverTimestamp() });
            
            setIsSubmitted(true);
            form.reset();
        }
    } catch (error) {
        console.error('Submission error:', error);
        toast({
         variant: "destructive",
         title: "Something went wrong",
         description: "Could not process your RSVP. Please try again.",
       });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <Card className="w-full max-w-2xl mx-auto rounded-2xl shadow-xl bg-background/90 backdrop-blur-sm">
          <CardHeader className="text-center p-6 md:p-8">
            <CardTitle className="font-headline text-5xl md:text-6xl text-primary">Kindly RSVP</CardTitle>
            <CardDescription className="text-base md:text-lg pt-2">
              We can't wait to celebrate with you!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="Benjamin@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="attending" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kindly confirm if you will honor us with your presence at our Reception? *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select your attendance" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="yes">Yes, I’ll be there</SelectItem>
                          <SelectItem value="no">Sorry, I can’t make it</SelectItem>
                        </SelectContent>
                      </Select>
                      {watchAttending === 'yes' && <FormDescription>We’ll send a confirmation to your inbox.</FormDescription>}
                      {watchAttending === 'no' && <FormDescription>Thank you — we will miss you!</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchAttending === 'yes' && (
                  <>
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(123) 456-7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="guests" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of guests attending (including yourself) *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select number of guests" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="relation" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please let us know your connection to the couple *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select your relation" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="bride-guest">Bride's guest</SelectItem>
                              <SelectItem value="groom-guest">Groom's guest</SelectItem>
                              <SelectItem value="family">Family</SelectItem>
                              <SelectItem value="friend">Friend</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="directions" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Do you need Direction to Locate the Venue? *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                <Button type="submit" size="lg" className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl" disabled={!watchAttending || isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Confirm Attendance'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isSubmitted} onOpenChange={setIsSubmitted}>
        <DialogContent className="sm:max-w-[425px] text-center bg-background rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline text-primary">
              {submittedData?.attending === 'yes' ? 'Thank You!' : 'We will miss you!'}
            </DialogTitle>
            <DialogDescription className="pt-2">
                {submittedData?.attending === 'yes' 
                ? 'Your RSVP has been confirmed. A confirmation has been sent to your email. We are so excited to celebrate with you!'
                : 'Thank you for letting us know. You will be missed!'}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setIsSubmitted(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
