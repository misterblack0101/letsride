import { Twitter, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

export default function Footer() {
  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded-t-lg border-t border-base-300">
      <div className="container mx-auto">
        <div className="grid grid-flow-col gap-4">
          <BrandLogo size="sm" />
        </div>

        <nav className="grid grid-flow-col gap-4">
          <Link href="/products" className="link link-hover">Products</Link>
          <Link href="/about" className="link link-hover">About Us</Link>
          <Link href="/contact" className="link link-hover">Contact</Link>
          <Link href="/privacy" className="link link-hover">Privacy Policy</Link>
        </nav>

        <nav>
          <div className="grid grid-flow-col gap-4">
            <Link href="#" className="btn btn-ghost btn-circle btn-sm hover:btn-primary">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="btn btn-ghost btn-circle btn-sm hover:btn-primary">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="#" className="btn btn-ghost btn-circle btn-sm hover:btn-primary">
              <Facebook className="h-5 w-5" />
            </Link>
          </div>
        </nav>

        <aside>
          <p className="text-sm opacity-70">
            © {new Date().getFullYear()} Let's Ride Online. All Rights Reserved.
          </p>
        </aside>
      </div>
    </footer>
  );
}
