"use client";

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { sendRsvpConfirmation } from '@/ai/flows/send-rsvp-confirmation';
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
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

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
    setSubmittedData(data);

    if (data.attending === "yes" && data.name) {
      try {
        const result = await sendRsvpConfirmation({ email: data.email, name: data.name });
        if (!result.success) {
           toast({
            variant: "destructive",
            title: "Email Failed",
            description: "Could not send the confirmation email. Please try again.",
          });
        }
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "An unexpected error occurred. Please try again.",
        });
      }
    }
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    form.reset();
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
                      {watchAttending === 'yes' && <FormDescription>We’ll send you the invitation email — check your inbox.</FormDescription>}
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
                
                <Button type="submit" size="lg" className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl" disabled={isSubmitting}>
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
                ? 'Your RSVP has been confirmed. We have sent the invitation to your email. We are so excited to celebrate with you!'
                : 'Thank you for letting us know. You will be missed!'}
            </DialogDescription>
          </DialogHeader>
          {submittedData?.attending === 'yes' && (
             <div className="py-4">
                <Image src="/images/benwedding.jpg" alt="Wedding Invitation" width={200} height={300} className="mx-auto rounded-lg shadow-lg" data-ai-hint="wedding invitation" />
             </div>
          )}
          <Button onClick={() => setIsSubmitted(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
