
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/guestbook', label: 'Guestbook' },
  { href: '/rsvp', label: 'RSVP' },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSolidNav, setShowSolidNav] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const isSolidNavPage = pathname === '/guestbook' || pathname === '/rsvp' || pathname === '/clientdashboard';
    
    // Set initial state based on path
    setShowSolidNav(isSolidNavPage);

    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setShowSolidNav(isScrolled || isSolidNavPage);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);


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
            showSolidNav ? 'text-foreground/80' : 'md:text-white text-foreground/80'
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
        showSolidNav ? 'bg-background/80 shadow-md backdrop-blur-sm' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <Heart className="w-6 h-6 text-primary transition-transform group-hover:scale-110" />
            <span  className={cn(
              "text-xl font-bold font-headline tracking-wider transition-colors duration-300",
              showSolidNav ? "text-primary" : "text-white"
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
                  <Button variant="ghost" size="icon" className={cn(showSolidNav ? 'bg-transparent' : 'bg-white/80 hover:bg-white')} >
                  <Menu className={cn("h-6 w-6", showSolidNav ? 'text-primary' : 'text-primary/80')} />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[320px] bg-background">
                <SheetHeader>
                  <SheetTitle className="sr-only">Main Menu</SheetTitle>
                </SheetHeader>
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
