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
                    src="data:image/jpeg;base64,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"
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
