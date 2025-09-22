
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  where,
  getDocs,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RsvpFormFields } from "./rsvp-form-fields";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Edit,
  Trash2,
  Send,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import emailjs from "@emailjs/browser";
import { invitationImageBase64 } from "./invitation-image";
import { Form } from "@/components/ui/form";

const rsvpFormSchema = z
  .object({
    email: z
      .string()
      .email({ message: "Please enter a valid email address." }),
    attending: z.enum(["yes", "no"], {
      required_error: "Please select an option.",
    }),
    name: z.string().optional(),
    phone: z.string().optional(),
    guests: z.string().optional(),
    relation: z.string().optional(),
    directions: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.attending === "yes") {
      if (!data.name || data.name.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["name"],
          message: "Name must be at least 2 characters.",
        });
      }
      if (!data.guests) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["guests"],
          message: "Please select the number of guests.",
        });
      }
    }
  });

type RsvpFormValues = z.infer<typeof rsvpFormSchema>;

interface RsvpEntry extends RsvpFormValues {
  id: string;
  createdAt?: any;
}

export function DashboardSection() {
  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [filteredRsvps, setFilteredRsvps] = useState<RsvpEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRsvp, setEditingRsvp] = useState<RsvpEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      email: "",
      attending: undefined,
      name: "",
      phone: "",
      guests: "",
      relation: "",
      directions: "",
    },
  });

  useEffect(() => {
    const q = query(collection(db, "rsvps"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rsvpsData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as RsvpEntry)
      );
      setRsvps(rsvpsData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = rsvps;

    // Filter by attendance status
    if (filter !== "all") {
      filtered = filtered.filter((rsvp) => rsvp.attending === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((rsvp) =>
        rsvp.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRsvps(filtered);
  }, [rsvps, filter, searchTerm]);

  const handleEdit = (rsvp: RsvpEntry) => {
    setEditingRsvp(rsvp);
    form.reset(rsvp);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "rsvps", id));
      toast({ title: "Guest removed successfully." });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not remove guest. Please try again.",
      });
    }
  };

  const handleResend = async (rsvp: RsvpEntry) => {
    if (rsvp.attending === "no") {
      toast({
        variant: "destructive",
        title: "Cannot Resend",
        description: "You cannot resend an invitation to a guest who is not attending.",
      });
      return;
    }
    
    toast({ title: `Resending invitation to ${rsvp.name}...` });

    try {
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
          <p>We can’t wait to share the joy, laughter, food, music, and dance with you! 🎶💃🕺</p>
          <br>
          <p>With love,</p>
          <p><strong>DeeWealth💍</strong></p>
        </div>
      `;

      const templateParams = {
        name: rsvp.name,
        to_email: rsvp.email,
        image_url: invitationImageBase64,
        email_body: emailBody,
      };

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      toast({
        title: "Invitation Sent!",
        description: `Successfully resent invitation to ${rsvp.name}.`,
      });
    } catch (error) {
      console.error("EmailJS error:", error);
      toast({
        variant: "destructive",
        title: "Send Failed",
        description: "Could not resend the invitation. Please try again.",
      });
    }
  };

  const openAddModal = () => {
    setEditingRsvp(null);
    form.reset({
      email: "",
      attending: undefined,
      name: "",
      phone: "",
      guests: "",
      relation: "",
      directions: "",
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: RsvpFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingRsvp) {
        // Update existing RSVP
        const rsvpRef = doc(db, "rsvps", editingRsvp.id);
        await updateDoc(rsvpRef, data);
        toast({ title: "Guest updated successfully!" });
      } else {
        // Add new RSVP, check for duplicates first
        const rsvpsRef = collection(db, "rsvps");
        const q = query(rsvpsRef, where("email", "==", data.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            toast({
                variant: "destructive",
                title: "Guest Already Exists",
                description: "An RSVP with this email already exists.",
            });
            setIsSubmitting(false);
            return;
        }

        await addDoc(rsvpsRef, { ...data, createdAt: serverTimestamp() });
        toast({ title: "Guest added successfully!" });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Could not save the RSVP details. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FilterButton = ({
    value,
    label,
    icon: Icon,
  }: {
    value: "all" | "yes" | "no";
    label: string;
    icon: React.ElementType;
  }) => (
    <Button
      variant={filter === value ? "default" : "outline"}
      onClick={() => setFilter(value)}
      className={cn(
        "transition-all duration-300",
        filter === value
          ? "bg-primary text-primary-foreground"
          : "bg-background/70 text-foreground"
      )}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="font-headline text-6xl md:text-7xl text-primary">
            Client Dashboard
          </h1>
          <p className="mt-4 text-lg text-foreground/80">
            Manage your guest list in real-time.
          </p>
        </header>

        <Card className="rounded-2xl shadow-lg p-4 md:p-6 bg-background/80 mb-8">
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Filter by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-full"
                        />
                    </div>
                    <Button onClick={openAddModal} className="w-full bg-foreground text-background hover:bg-foreground/90">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Guest
                    </Button>
                </div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    <FilterButton value="all" label="All Guests" icon={Users} />
                    <FilterButton value="yes" label="Coming" icon={UserCheck} />
                    <FilterButton value="no" label="Not Coming" icon={UserX} />
                </div>
            </div>
        </Card>

        {/* Desktop Table View */}
        <div className="hidden md:block">
            <Card className="rounded-2xl shadow-lg overflow-hidden bg-background/80">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-center">Guests</TableHead>
                        <TableHead className="text-center">Attendance</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredRsvps.map((rsvp) => (
                        <TableRow key={rsvp.id} className="hover:bg-accent/50 transition-colors">
                        <TableCell className="font-medium">{rsvp.name || "-"}</TableCell>
                        <TableCell>{rsvp.email}</TableCell>
                        <TableCell>{rsvp.phone || "-"}</TableCell>
                        <TableCell className="text-center">{rsvp.attending === 'yes' ? rsvp.guests : "-"}</TableCell>
                        <TableCell className="text-center">
                            <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-semibold",
                                rsvp.attending === "yes" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            )}>
                                {rsvp.attending === "yes" ? "Coming" : "Not Coming"}
                            </span>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(rsvp)} className="hover:text-primary transition-colors">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="hover:text-destructive transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                        This will permanently delete the RSVP for {rsvp.name}. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(rsvp.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <Button variant="ghost" size="icon" onClick={() => handleResend(rsvp)} className="hover:text-blue-500 transition-colors" disabled={rsvp.attending === 'no'}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </Card>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {filteredRsvps.map((rsvp) => (
            <Card key={rsvp.id} className="rounded-2xl shadow-lg bg-background/80 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg text-primary">{rsvp.name || rsvp.email}</p>
                        {rsvp.name && <p className="text-sm text-foreground/70">{rsvp.email}</p>}
                    </div>
                    <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold",
                        rsvp.attending === "yes" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    )}>
                        {rsvp.attending === "yes" ? "Coming" : "Not Coming"}
                    </span>
                </div>
                <div className="border-t my-3"></div>
                <div className="text-sm space-y-1 text-foreground/80">
                  <p><strong>Phone:</strong> {rsvp.phone || "-"}</p>
                  <p><strong>Guests:</strong> {rsvp.attending === 'yes' ? rsvp.guests : "-"}</p>
                </div>
                <div className="border-t my-3"></div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(rsvp)}><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This will permanently delete the RSVP for {rsvp.name}. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(rsvp.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="outline" size="sm" onClick={() => handleResend(rsvp)} disabled={rsvp.attending === 'no'}><Send className="h-4 w-4 mr-1" /> Resend</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px] bg-background rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-4xl text-primary">
              {editingRsvp ? "Edit Guest" : "Add New Guest"}
            </DialogTitle>
            <DialogDescription>
              {editingRsvp ? "Update the details for this guest." : "Fill in the details to add a new guest to the list."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <RsvpFormFields form={form} />
              <DialogFooter>
                  <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting} className="bg-foreground text-background hover:bg-foreground/90">
                      {isSubmitting ? "Saving..." : "Save Guest"}
                  </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
