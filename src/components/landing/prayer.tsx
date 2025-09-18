import { Heart } from "lucide-react";

export function Prayer() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Heart className="w-16 h-16 text-primary/50" />
          </div>
          <h2 className="font-headline text-6xl md:text-7xl text-primary mb-6">A Prayer for Us</h2>
          <div className="space-y-6 text-foreground/80 text-lg italic">
            <p>
              We pray for a marriage filled with unwavering love and endless laughter. May our home be a sanctuary of peace, a haven of support, and a place where joy resides.
            </p>
            <p>
              May we always be each other's greatest cheerleaders, lifting one another up through challenges and celebrating every triumph. We ask for the wisdom to navigate life's journey together, and the grace to forgive and grow.
            </p>
            <p>
              Surrounded by our beloved family and friends, we feel truly blessed. Thank you for being a part of our story and for your prayers as we begin our life as one.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
