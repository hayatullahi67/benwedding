import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FloatingHearts } from '@/components/landing/floating-hearts';
import { FloralDecor } from '@/components/shared/floral-decor';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Hero() {
  const invitationImage = PlaceHolderImages.find(p => p.id === 'wedding-invitation');

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12">
      <FloatingHearts />
      <FloralDecor className="absolute top-0 left-0 w-48 h-48 text-primary/30 transform -translate-x-1/4 -translate-y-1/4" />
      <FloralDecor className="absolute bottom-0 right-0 w-48 h-48 text-primary/30 transform translate-x-1/4 translate-y-1/4 rotate-180" />
      
      <div className="container mx-auto px-4 z-10">
        <div className="grid grid-cols-1 md:grid-cols-8 gap-8 items-center">
          <div className="md:col-span-8 lg:col-span-5 text-center lg:text-left">
            <h2 className="text-lg md:text-xl text-foreground/80 mb-4">
              Together with our families, we joyfully invite you to celebrate our wedding
            </h2>
            <h1 className="font-headline text-7xl md:text-8xl lg:text-9xl text-primary mb-6">
              Deborah Jijil & Benjamin Ogbeh
            </h1>
            <p className="max-w-2xl mx-auto lg:mx-0 text-base md:text-lg text-foreground/90 mb-8">
              We celebrate love, family, and new beginnings — we hope you’ll join us as we say ‘I do’. Your presence will make our day complete.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 rounded-2xl px-8 py-6 text-lg shadow-lg hover:scale-105 transition-transform">
                <Link href="/rsvp">RSVP Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-primary/50 text-primary hover:bg-accent hover:border-primary rounded-2xl px-8 py-6 text-lg shadow-lg hover:scale-105 transition-transform">
                <Link href="/guestbook">Share a Memory</Link>
              </Button>
            </div>
          </div>
          
          <div className="hidden lg:block lg:col-span-3">
            <div className="relative aspect-[2/3] w-full max-w-sm mx-auto p-4">
              <div className="absolute inset-0 bg-secondary/50 rounded-2xl transform rotate-3"></div>
              {invitationImage && (
                <Image
                  src={invitationImage.imageUrl}
                  alt={invitationImage.description}
                  width={400}
                  height={600}
                  className="relative object-cover rounded-2xl shadow-2xl transform transition-transform duration-500 hover:scale-105 hover:-rotate-1"
                  data-ai-hint={invitationImage.imageHint}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
