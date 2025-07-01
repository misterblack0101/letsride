"use client";

import Link from 'next/link';
import { Bike, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useCart } from '@/context/cart-context';

export default function Header() {
  const { itemCount } = useCart();

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2">
            <Bike className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline text-foreground">Let's Ride</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors">
              Store
            </Link>
            <Link href="/about" className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors">
              About Us
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="icon" className="relative">
              <Link href="/cart">
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                   <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {itemCount > 9 ? '9+' : itemCount}
                  </div>
                )}
                <span className="sr-only">Shopping Cart</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
