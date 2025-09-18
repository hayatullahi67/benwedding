import { cn } from "@/lib/utils";

interface FloralDecorProps extends React.SVGProps<SVGSVGElement> {}

export function FloralDecor({ className, ...props }: FloralDecorProps) {
  return (
    <div className={cn("pointer-events-none", className)}>
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        {...props}
      >
        <path
          fill="currentColor"
          d="M100,5 C120,20 130,40 120,60 C140,70 160,80 180,70 C190,90 180,110 170,120 C150,130 140,150 150,170 C130,190 110,180 100,195 C90,180 70,190 50,170 C60,150 50,130 30,120 C20,110 10,90 20,70 C40,80 60,70 80,60 C70,40 80,20 100,5 Z"
          opacity="0.2"
        ></path>
        <path
          fill="currentColor"
          d="M100,20 C115,35 125,50 115,65 C130,75 145,85 165,75 C170,90 165,105 155,115 C140,125 130,140 140,155 C125,170 110,165 100,180 C90,165 75,170 60,155 C70,140 60,125 45,115 C35,105 30,90 35,75 C55,85 70,75 85,65 C75,50 85,35 100,20 Z"
          opacity="0.3"
        ></path>
      </svg>
    </div>
  );
}
