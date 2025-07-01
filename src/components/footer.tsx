import { Twitter, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';
import BrandLogo from '@/components/brand-logo';

export default function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <BrandLogo size="sm" />
          <div className="text-center text-muted-foreground text-sm">
            © {new Date().getFullYear()} Let's Ride Online. All Rights Reserved.
          </div>
          <div className="flex space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
