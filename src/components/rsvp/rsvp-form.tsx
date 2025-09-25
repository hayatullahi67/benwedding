
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
  phone: z.string().optional(),
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
              <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6;">
                <p>Thank you for confirming your attendance! 💕</p>
                <p>We’re so excited to celebrate this special day with you.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p><strong>📍 Reception Details:</strong></p>
                <p style="margin: 5px 0;"><strong>Venue:</strong> Agaya Hotel, Kwandere Road. Lafia</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> 1st Nov, 2025</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> 4pm</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p><strong>✨ Important Info:</strong></p>
                <ul style="list-style-type: none; padding-left: 0;">
                  <li style="margin-bottom: 10px;">- Please arrive 15–20 minutes early so you don’t miss the grand entrance.</li>
                  <li style="margin-bottom: 10px;">- Colors Of the Day: Metallic Brown, Burgundy and Tan</li>
                  <li style="margin-bottom: 10px;">- For questions, kindly reach us at: 08169536118</li>
                </ul>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <a href="https://benwedding.vercel.app/RSVP.pdf"  style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Download Your Invitation</a>
                <p>We can’t wait to share the joy, laughter, food, music, and dance with you! 🎶💃🕺</p>
                <br>
                <p>With love,</p>
                <p><strong>DeeWealth💍</strong></p>
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
                        <Input placeholder="adewale@example.com" {...field} />
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
