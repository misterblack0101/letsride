'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import BrandLogo from '@/components/brand-logo';
import SearchComponent from '@/components/search';
import { useState } from 'react';
import MegaMenu from './mega-menu';
import MobileDrawer from './mobile-drawer';
import { Menu } from 'lucide-react';

interface HeaderContentProps {
  categories?: Record<string, string[]>;
}

export default function HeaderContent({ categories }: HeaderContentProps) {
  const { itemCount } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white text-black border-b border-gray-200">
        {/* Left - Menu */}
        <MobileDrawer categories={categories} />

        {/* Center - Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="hover:opacity-80 transition-all duration-200">
            <BrandLogo size="sm" />
          </Link>
        </div>

        {/* Right - Cart */}
        <div className="flex items-center gap-4">
          <SearchComponent
            isOpen={isSearchOpen}
            onToggle={() => setIsSearchOpen(!isSearchOpen)}
            isMobile={true}
          />

          <div className="indicator">
            {itemCount > 0 && (
              <span className="indicator-item badge badge-sm bg-primary text-white font-bold">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
            <Link
              href="/cart"
              className="hover:text-primary transition-transform hover:scale-110"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:flex flex-col w-full bg-white text-black">
        {/* Top row */}
        <div className="w-full border-b border-gray-200">
          <div className="container mx-auto flex items-center justify-between py-4 font-light tracking-widest uppercase text-sm relative">
            {/* Left - Search */}
            <div className="flex items-center gap-6">
              <SearchComponent
                isOpen={isSearchOpen}
                onToggle={() => setIsSearchOpen(!isSearchOpen)}
                isMobile={false}
              />
            </div>

            {/* Center - Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link href="/" className="hover:opacity-80 transition-all duration-200">
                <BrandLogo size="md" />
              </Link>
            </div>

            {/* Right - Links & Cart */}
            <div className="flex items-center gap-6">
              <Link
                href="/products"
                className={`hover:text-primary transition-colors ${isActive('/products') ? 'text-primary font-semibold' : ''
                  }`}
              >
                All Products
              </Link>

              <div className="indicator">
                {itemCount > 0 && (
                  <span className="indicator-item badge badge-sm bg-primary text-white font-bold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
                <Link
                  href="/cart"
                  className="hover:text-primary transition-transform hover:scale-110"
                >
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mega Menu row */}
        {categories && (
          <div className="w-full border-b border-gray-200">
            <div className="container mx-auto py-2">
              <MegaMenu data={categories} />
            </div>
          </div>
        )}
      </header>
    </>
  );
}
