import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"

export function Hero() {
  const heroImages = PlaceHolderImages.filter(p => p.id.startsWith('hero-'));

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 text-background">
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <Carousel
        opts={{ loop: true }}
        plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
        className="absolute inset-0 w-full h-full"
      >
        <CarouselContent>
          {heroImages.map(image => (
            <CarouselItem key={image.id}>
              <Image
                src={image.imageUrl}
                alt={image.description}
                fill
                className="object-cover"
                priority
                data-ai-hint={image.imageHint}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      <div className="container mx-auto px-4 z-20">
        <div className="text-center">
            <h2 className="text-lg md:text-xl text-background/80 mb-4">
              Together with our families, we joyfully invite you to celebrate our wedding
            </h2>
            <h1 className="font-headline text-7xl md:text-8xl lg:text-9xl text-white mb-6 drop-shadow-lg">
              Deborah Jijil & Benjamin Ogbeh
            </h1>
            <p className="max-w-3xl mx-auto text-base md:text-lg text-background/90 mb-8 drop-shadow-sm">
              We celebrate love, family, and new beginnings — we hope you’ll join us as we say ‘I do’. Your presence will make our day complete.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto bg-background text-foreground hover:bg-background/90 rounded-2xl px-8 py-6 text-lg shadow-lg hover:scale-105 transition-transform">
                <Link href="/rsvp">RSVP Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-white/50 text-white hover:bg-white/10 hover:border-white rounded-2xl px-8 py-6 text-lg shadow-lg hover:scale-105 transition-transform">
                <Link href="/guestbook">Share a Memory</Link>
              </Button>
            </div>
          </div>
      </div>
    </section>
  );
}
