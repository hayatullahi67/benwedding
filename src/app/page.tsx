import { Hero } from "@/components/landing/hero";
import { OurStory } from "@/components/landing/our-story";
import { Prayer } from "@/components/landing/prayer";

export default function Home() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <OurStory />
      <Prayer />
    </div>
  );
}
