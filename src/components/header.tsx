"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import BrandLogo from '@/components/brand-logo';
import SearchComponent from '@/components/search';
import MobileSidebar from '@/components/mobile-sidebar';
import { useState } from 'react';

export default function Header() {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 z-40 border-b border-base-200">
      {/* Mobile Layout */}
      <div className="flex items-center justify-between w-full lg:hidden px-4">
        {/* Mobile Search */}
        <SearchComponent
          isOpen={isSearchOpen}
          onToggle={() => setIsSearchOpen(!isSearchOpen)}
          isMobile={true}
        />

        {/* Mobile Brand Logo - Center */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className="btn btn-ghost normal-case hover:bg-transparent hover:scale-105 transition-all duration-200">
            <BrandLogo size="sm" />
          </Link>
        </div>

        {/* Mobile Hamburger Menu */}
        <MobileSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between w-full">
        {/* Desktop Search - Left */}
        <div className="navbar-start">
          <SearchComponent
            isOpen={isSearchOpen}
            onToggle={() => setIsSearchOpen(!isSearchOpen)}
            isMobile={false}
          />
        </div>

        {/* Desktop Brand Logo - Center */}
        <div className="navbar-center absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className="btn btn-ghost normal-case text-xl hover:bg-transparent hover:scale-105 transition-all duration-200">
            <BrandLogo size="md" />
          </Link>
        </div>

        {/* Desktop Navigation - Right */}
        <div className="navbar-end">
          <div className="flex items-center gap-2">
            {/* Home Link */}
            <Link
              href="/"
              className={`btn btn-ghost text-lg font-medium transition-all duration-200 ${isActive('/')
                ? 'text-primary bg-primary/10 border-primary/20'
                : 'hover:text-primary hover:bg-primary/5 hover:scale-105'
                }`}
            >
              Home
            </Link>

            {/* All Products Link */}
            <Link
              href="/products"
              className={`btn btn-ghost text-lg font-medium transition-all duration-200 ${isActive('/products')
                ? 'text-primary bg-primary/10 border-primary/20'
                : 'hover:text-primary hover:bg-primary/5 hover:scale-105'
                }`}
            >
              All Products
            </Link>

            {/* Cart Button */}
            <div className="indicator">
              {itemCount > 0 && (
                <span className="indicator-item badge badge-primary badge-sm font-bold animate-pulse">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
              <Link
                href="/cart"
                className={`btn btn-ghost btn-circle transition-all duration-200 ${isActive('/cart')
                  ? 'text-primary bg-primary/10 border-primary/20'
                  : 'hover:text-primary hover:bg-primary/5 hover:scale-110'
                  }`}
              >
                <ShoppingCart className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
