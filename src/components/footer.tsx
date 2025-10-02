import { Instagram } from 'lucide-react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

export default function Footer() {
  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded-t-lg border-t border-base-300">
      <div className="container mx-auto">
        <div className="grid grid-flow-col gap-4">
          <BrandLogo size="sm" />
          <Link href="https://www.instagram.com/letsrideecycles/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-circle btn-sm hover:btn-primary">
            <Instagram className="h-5 w-5" />
          </Link>
        </div>

        <nav className="grid grid-flow-col gap-4">
          <Link href="/products" className="link link-hover">Products</Link>
          <Link href="https://maps.app.goo.gl/ZGA5749fc5VKdQSJ7" target="_blank" rel="noopener noreferrer" className="link link-hover">Store Locator</Link>
          <Link href="https://share.google/DXPF910FUbucvI8Du" target="_blank" rel="noopener noreferrer" className="link link-hover">Contact Us</Link>
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
