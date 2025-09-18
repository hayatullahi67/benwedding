"use client";

import { useEffect, useState } from 'react';
import { Heart, Flower } from 'lucide-react';

const icons = [
  (props: React.SVGProps<SVGSVGElement>) => <Heart {...props} />,
  (props: React.SVGProps<SVGSVGElement>) => <Flower {...props} />,
  () => <>🌸</>,
  () => <>💖</>,
];

interface FloatingElement {
  id: number;
  style: React.CSSProperties;
  Icon: React.ElementType;
}

export function FloatingHearts() {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    const createElements = () => {
      const newElements: FloatingElement[] = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 10 + 12}s`,
          animationDelay: `${Math.random() * 12}s`,
          transform: `scale(${Math.random() * 0.7 + 0.5})`,
          opacity: Math.random() * 0.5 + 0.2,
          fontSize: `${Math.random() * 1.5 + 0.75}rem`,
        },
        Icon: icons[Math.floor(Math.random() * icons.length)],
      }));
      setElements(newElements);
    };

    createElements();
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-30">
      {elements.map(({ id, style, Icon }) => (
        <div
          key={id}
          className="absolute bottom-[-50px] animate-float-slow text-primary/60"
          style={style}
        >
          <Icon className="w-auto h-auto fill-current" />
        </div>
      ))}
    </div>
  );
}
