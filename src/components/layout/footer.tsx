import Link from 'next/link';
import { Heart, Instagram, Twitter, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary/50 text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <p className="text-sm">Made with love for Deborah & Benjamin</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm">Have questions? Reach out:</p>
            <div className="flex gap-4 justify-center">
              <a href="tel:+1234567890" className="text-sm font-medium hover:text-primary transition-colors">+1 (234) 567-890</a>
              <a href="tel:+0987654321" className="text-sm font-medium hover:text-primary transition-colors">+0 (987) 654-321</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" aria-label="Instagram">
              <Instagram className="w-5 h-5 text-foreground/70 hover:text-primary transition-colors" />
            </Link>
            <Link href="#" aria-label="Twitter">
              <Twitter className="w-5 h-5 text-foreground/70 hover:text-primary transition-colors" />
            </Link>
            <Link href="#" aria-label="Facebook">
              <Facebook className="w-5 h-5 text-foreground/70 hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-xs text-foreground/60">
          <p>&copy; {new Date().getFullYear()} Forever Bloom. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
