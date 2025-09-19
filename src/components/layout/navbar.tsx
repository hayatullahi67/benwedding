"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/guestbook', label: 'Guestbook' },
  { href: '/rsvp', label: 'RSVP' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLinkItems = ({ isMobile }: { isMobile?: boolean }) => (
    <>
      {navLinks.map((link) => (
        <Button
          key={link.href}
          variant="ghost"
          asChild
          className={cn(
            'hover:text-foreground hover:bg-accent/50 transition-colors',
            isMobile && 'w-full justify-start text-lg py-6',
            isScrolled ? 'text-green-500' : 'md:text-white text-foreground/80'
          )}
          onClick={() => isMobile && setIsMenuOpen(false)}
        >
          <Link href={link.href}>{link.label}</Link>
        </Button>
      ))}
    </>
  );

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-background/80 shadow-md backdrop-blur-sm' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <Heart className="w-6 h-6 text-primary transition-transform group-hover:scale-110" />
            <span  className={cn(
    "text-xl font-bold font-headline tracking-wider transition-colors duration-300",
    isScrolled ? "text-green-500" : "text-white "
  )}>
              D & B
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            <NavLinkItems />
          </nav>
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild >
                  <Button variant="ghost" size="icon" className='bg-[white]' >
                  <Menu className="h-6 w-6 " />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[320px] bg-background">
                <div className="flex flex-col items-start gap-4 pt-12">
                  <NavLinkItems isMobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
