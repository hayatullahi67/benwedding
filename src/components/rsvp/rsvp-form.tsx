"use client";

import { useState, useRef } from 'react';
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

// Base64 encoded image data for the wedding invitation
const invitationImageBase64 = "data:image/jpeg;base64,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";

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
    setSubmittedData(data);

    if (data.attending === 'no') {
      setIsSubmitted(true);
      setIsSubmitting(false);
      form.reset();
      return;
    }

    if (data.attending === "yes" && data.name && data.email) {
      const templateParams = {
        name: data.name,
        to_email: data.email,
        image_url: invitationImageBase64,
      };
      
      try {
        await emailjs.send(
          'service_r4ug4nt',
          'template_4lccsji',
          templateParams,
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
        );
        setIsSubmitted(true);
        form.reset();
      } catch (error) {
         console.error('EmailJS error:', error);
         toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Could not send your confirmation email. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
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

    