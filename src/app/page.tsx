import { FloatingHearts } from "@/components/landing/floating-hearts";
import { Hero } from "@/components/landing/hero";
import { OurStory } from "@/components/landing/our-story";
import { Prayer } from "@/components/landing/prayer";

export default function Home() {
  return (
    <div className="overflow-hidden relative">
      <FloatingHearts />
      <Hero />
      <OurStory />
      <Prayer />
    </div>
  );
}
