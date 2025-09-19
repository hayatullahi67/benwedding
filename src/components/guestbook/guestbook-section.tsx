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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { formatDistanceToNow } from 'date-fns';

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

interface Memory {
    id: string;
    name: string;
    message: string;
    photo?: string | null;
    createdAt: any;
    likes: number;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export function GuestbookSection() {
  const { toast } = useToast();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [likedMemories, setLikedMemories] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "guestbook"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const memoriesData: Memory[] = [];
        querySnapshot.forEach((doc) => {
            memoriesData.push({ id: doc.id, ...doc.data() } as Memory);
        });
        setMemories(memoriesData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
      const localLikes = localStorage.getItem("likedMemories");
      if (localLikes) {
          setLikedMemories(new Set(JSON.parse(localLikes)));
      }
  }, []);

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
        if (file.size > MAX_FILE_SIZE) {
            toast({
                variant: "destructive",
                title: "File is too large",
                description: "Please upload an image smaller than 2MB.",
            });
            setPreview(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
            form.setValue("photo", null);
            return;
        }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        form.setValue("photo", reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      form.setValue("photo", null);
    }
  };

  async function onSubmit(data: GuestbookFormValues) {
    setIsSubmitting(true);
    try {
        await addDoc(collection(db, "guestbook"), {
            name: data.name,
            message: data.message,
            photo: data.photo || null,
            createdAt: serverTimestamp(),
            likes: 0,
        });

        toast({
          title: "Memory Shared!",
          description: "Thank you for sharing your beautiful memory with us.",
        });
        form.reset();
        setPreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    } catch(error) {
        console.error("Error adding document: ", error);
        toast({
            variant: "destructive",
            title: "Something went wrong",
            description: "Could not save your memory. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const toggleLike = async (id: string) => {
    const memory = memories.find(m => m.id === id);
    if (!memory) return;

    const newLikedMemories = new Set(likedMemories);
    const memoryRef = doc(db, "guestbook", id);
    let newLikes = memory.likes;

    if (newLikedMemories.has(id)) {
        newLikedMemories.delete(id);
        newLikes = Math.max(0, memory.likes - 1);
    } else {
        newLikedMemories.add(id);
        newLikes = memory.likes + 1;
    }
    
    setLikedMemories(newLikedMemories);
    localStorage.setItem("likedMemories", JSON.stringify(Array.from(newLikedMemories)));

    try {
        await updateDoc(memoryRef, {
            likes: newLikes
        });
    } catch(error) {
        console.error("Error updating likes:", error);
        // Revert local state on error
        const revertedLikes = new Set(likedMemories);
        if (revertedLikes.has(id)) {
            revertedLikes.delete(id);
        } else {
            revertedLikes.add(id);
        }
        setLikedMemories(revertedLikes);
        localStorage.setItem("likedMemories", JSON.stringify(Array.from(revertedLikes)));
    }
  }
  
  const formatDate = (date: any) => {
    if (!date) return "Just now";
    return formatDistanceToNow(date.toDate(), { addSuffix: true });
  }

  return (
    <div className="container mx-auto px-4 pt-[20px]">
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
                      <FormLabel>Share a Photo (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                          Maximum file size: 2MB.
                      </FormDescription>
                      {preview && (
                        <div className="mt-4 relative w-48 h-48">
                            <Image src={preview} alt="Preview" fill className="rounded-lg object-cover"/>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full bg-foreground text-background hover:bg-foreground/90" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Memory"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
                <Card key={memory.id} className="rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden">
                    {memory.photo && (
                       <div className="relative w-full h-48">
                           <Image src={memory.photo} alt={`Memory from ${memory.name}`} fill className="object-cover" />
                       </div>
                    )}
                    <CardContent className="p-6 flex flex-col flex-grow">
                        <div className="flex-grow">
                            <p className="text-foreground/90 mb-4">"{memory.message}"</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div>
                                <p className="font-semibold text-primary">{memory.name}</p>
                                <p className="text-xs text-foreground/60">{formatDate(memory.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-foreground/70">{memory.likes || 0}</span>
                                <Button variant="ghost" size="icon" onClick={() => toggleLike(memory.id)}>
                                    <Heart className={cn("w-5 h-5 transition-colors", likedMemories.has(memory.id) ? "text-red-500 fill-current" : "text-foreground/50")}/>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
