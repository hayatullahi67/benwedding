"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const guestbookFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
  photo: z.any().optional(),
});

type GuestbookFormValues = z.infer<typeof guestbookFormSchema>;

const mockMemories = [
    { id: 1, name: "Aunt Carol", message: "So excited for you both! Wishing you a lifetime of happiness.", liked: false, date: "2 days ago", photo: PlaceHolderImages.find(p => p.id === 'memory-1')?.imageUrl },
    { id: 2, name: "John & Sarah", message: "Can't wait to celebrate with you! The invitation is beautiful.", liked: true, date: "3 days ago", photo: null },
    { id: 3, name: "Michael P.", message: "Congratulations! So happy to be a part of your special day.", liked: false, date: "5 days ago", photo: PlaceHolderImages.find(p => p.id === 'memory-2')?.imageUrl },
    { id: 4, name: "The Millers", message: "Wishing you all the best on your journey together. Cheers!", liked: true, date: "1 week ago", photo: null },
    { id: 5, name: "Cousin Dave", message: "Get ready to party! So thrilled for you two.", liked: false, date: "1 week ago", photo: PlaceHolderImages.find(p => p.id === 'memory-3')?.imageUrl },
    { id: 6, name: "Grandma Sue", message: "My darlings, I am overjoyed. Can't wait to see you walk down the aisle.", liked: true, date: "2 weeks ago", photo: PlaceHolderImages.find(p => p.id === 'memory-4')?.imageUrl },
];

export function GuestbookSection() {
  const { toast } = useToast();
  const [memories, setMemories] = useState(mockMemories);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<GuestbookFormValues>({
    resolver: zodResolver(guestbookFormSchema),
    defaultValues: {
      name: "",
      message: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  function onSubmit(data: GuestbookFormValues) {
    const newMemory = {
        id: memories.length + 1,
        name: data.name,
        message: data.message,
        liked: false,
        date: "Just now",
        photo: preview,
    }
    setMemories([newMemory, ...memories]);
    toast({
      title: "Memory Shared!",
      description: "Thank you for sharing your beautiful memory with us.",
    });
    form.reset();
    setPreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const toggleLike = (id: number) => {
    setMemories(memories.map(m => m.id === id ? {...m, liked: !m.liked} : m));
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="font-headline text-6xl md:text-7xl text-primary">Share Your Memories</h1>
            <p className="mt-4 text-lg text-foreground/80">Leave a note and share a photo for the happy couple!</p>
        </div>

        <Card className="mb-12 rounded-2xl shadow-lg p-6 md:p-8 bg-background/80">
          <CardContent className="p-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share a memory or well wishes..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Share a Photo</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            field.onChange(e.target.files);
                            handleFileChange(e);
                          }}
                          ref={fileInputRef}
                        />
                      </FormControl>
                      {preview && (
                        <div className="mt-4 relative w-48 h-48">
                            <Image src={preview} alt="Preview" layout="fill" className="rounded-lg object-cover"/>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full bg-foreground text-background hover:bg-foreground/90">Submit Memory</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
                <Card key={memory.id} className="rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden">
                    {memory.photo && (
                       <div className="relative w-full h-48">
                           <Image src={memory.photo} alt={`Memory from ${memory.name}`} layout="fill" className="object-cover" />
                       </div>
                    )}
                    <CardContent className="p-6 flex flex-col flex-grow">
                        <div className="flex-grow">
                            <p className="text-foreground/90 mb-4">"{memory.message}"</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div>
                                <p className="font-semibold text-primary">{memory.name}</p>
                                <p className="text-xs text-foreground/60">{memory.date}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => toggleLike(memory.id)}>
                                <Heart className={cn("w-5 h-5 transition-colors", memory.liked ? "text-red-500 fill-current" : "text-foreground/50")}/>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
