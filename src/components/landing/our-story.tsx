import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { FloralDecor } from '../shared/floral-decor';

export function OurStory() {
  const storyImage = PlaceHolderImages.find(p => p.id === 'our-story-image');

  return (
    <section className="py-24 bg-background relative z-10">
      <FloralDecor className="absolute -top-12 right-0 w-64 h-64 text-primary/10 transform translate-x-1/4 -translate-y-1/4 rotate-90" />
      <FloralDecor className="absolute -bottom-12 left-0 w-64 h-64 text-primary/10 transform -translate-x-1/4 translate-y-1/4 -rotate-90" />
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative w-full max-w-sm mx-auto aspect-[3/4]">
             <div className="absolute inset-0 bg-background/50 rounded-2xl transform -rotate-3"></div>
             {storyImage && (
                <Image
                    src={storyImage.imageUrl}
                    alt={storyImage.description}
                    width={600}
                    height={800}
                    className="relative object-cover rounded-2xl shadow-2xl transform transition-transform duration-500 hover:scale-105 hover:rotate-2"
                    data-ai-hint={storyImage.imageHint}
                />
             )}
          </div>
          <div className="text-center md:text-left">
            <h2 className="font-headline text-6xl md:text-7xl text-primary mb-6">Our Story</h2>
            <div className="space-y-6 text-foreground/80 text-lg">
                <p>
                Our journey began not with a spark, but with a slow, steady flame. We met through mutual friends, two paths crossing at just the right moment. What started as casual conversations grew into a deep connection, built on shared laughter, late-night talks, and a mutual love for spontaneous adventures.
                </p>
                <p>
                Through every season of life, we found more than just a partner in each other; we found a best friend, a confidant, and a home. Now, we're ready to start our forever chapter, and we are so incredibly excited to share the beginning of it with you, our cherished family and friends.
                </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
