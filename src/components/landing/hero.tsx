"use client";

import { useEffect, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from "@/lib/utils";

export function Hero() {
  const heroImages = [
    {
      id: "hero-1",
      imageUrl: "https://images.pexels.com/photos/1024973/pexels-photo-1024973.jpeg",
      description: "A couple holding hands, showing a wedding ring.",
      imageHint: "couple hands"
    },
    {
      id: "hero-2",
      imageUrl: "https://images.pexels.com/photos/278849/pexels-photo-278849.jpeg",
      description: "Close-up of two wedding rings.",
      imageHint: "wedding rings"
    },
    {
      id: "hero-3",
      imageUrl: "https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg",
      description: "A bouquet of pink roses.",
      imageHint: "roses bouquet"
    },
    {
      id: "hero-4",
      imageUrl: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg",
      description: "A beautiful wedding bouquet on a table.",
      imageHint: "wedding bouquet"
    }
  ];
  
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % heroImages.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background carousel */}
      {heroImages.map((image, index) => (
        <Image
          key={image.id}
          src={image.imageUrl}
          alt={image.description}
          fill
          priority={index === 0}
          className={cn(
            "object-cover transition-opacity duration-1000 ease-in-out",
            index === current ? "opacity-100" : "opacity-0"
          )}
          data-ai-hint={image.imageHint}
        />
      ))}

      {/* Dark overlay to make text visible */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Hero content */}
      <div className="relative z-10 text-center text-white px-6 max-w-3xl">
        <h2 className="text-lg md:text-xl text-white/80 mb-4 drop-shadow-md">
          Together with our families, we joyfully invite you to celebrate our wedding
        </h2>
        <h1 className="text-6xl md:text-8xl font-headline mb-6 drop-shadow-lg">
          Deborah Jijil & Benjamin Ogbeh
        </h1>
        <p className="text-lg md:text-xl mb-8 text-white/90">
          We celebrate love, family, and new beginnings — we hope you’ll join us as we say ‘I do’. Your presence will make our day complete.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-8 py-6 text-lg shadow-lg hover:scale-105 transition-transform">
                <Link href="/rsvp">RSVP Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto bg-white/20 hover:bg-white/30 border-white/50 text-white rounded-2xl px-8 py-6 text-lg shadow-lg hover:scale-105 transition-transform">
                <Link href="/guestbook">Share a Memory</Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
