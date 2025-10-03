'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/cart-context';
import BrandLogo from '@/components/BrandLogo';
import HeaderSearch from '@/components/header/HeaderSearch';
import MegaMenu from './MegaMenu';
import MobileDrawer from '../MobileDrawer';

interface CategoryData {
  subcategoriesByCategory: Record<string, string[]>;
  brandsBySubcategory: Record<string, Record<string, string[]>>;
}

interface HeaderContentProps {
  categoriesData: CategoryData;
}

export default function HeaderClient({ categoriesData }: HeaderContentProps) {
  const { subcategoriesByCategory } = categoriesData;
  const { itemCount } = useCart();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  if (pathname.startsWith('/admin')) {
    return null;
  }
  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white text-black border-b border-gray-200">
        {/* Left - Menu */}
        <MobileDrawer subcategories={subcategoriesByCategory} brandsBySubcategory={categoriesData.brandsBySubcategory} />

        {/* Center - Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="hover:opacity-80 transition-all duration-200">
            <BrandLogo size="sm" />
          </Link>
        </div>

        {/* Right - Search & Cart */}
        <div className="flex items-center gap-4">
          <HeaderSearch isMobile={true} />

          <Link
            href="/cart"
            className="relative hover:text-blue-600 transition-transform hover:scale-110"
          >
            <ShoppingCart className="h-6 w-6" />

            {itemCount > 0 && (
              <span
                className="absolute -top-2 -right-2 bg-[#0ea5e9] text-white 
                   w-6 h-6 flex items-center justify-center 
                   rounded-full text-xs font-bold shadow-md"
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
        </div>

      </header>

      {/* Desktop Header */}
      <header className="hidden lg:flex flex-col w-full bg-white text-black">
        {/* Top row */}
        <div className="w-full border-b border-gray-200">
          <div className="container mx-auto flex items-center justify-between py-4 font-light tracking-widest uppercase text-sm relative">
            {/* Left - Search */}
            <div className="flex items-center gap-6">
              <HeaderSearch isMobile={false} />
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
                Store
              </Link>

              <Link
                href="/cart"
                className="relative hover:text-blue-600 transition-transform hover:scale-110"
              >
                <ShoppingCart className="h-6 w-6" />

                {itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-[#0ea5e9] text-white 
                 w-4 h-4 flex items-center justify-center 
                 rounded-full text-[10px] font-bold shadow-md"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mega Menu row */}
        {subcategoriesByCategory && Object.keys(subcategoriesByCategory).length > 0 && (
          <div className="w-full border-b border-gray-200">
            <div className="container mx-auto py-2">
              <MegaMenu
                data={subcategoriesByCategory}
                brandsBySubcategory={categoriesData.brandsBySubcategory}
              />
            </div>
          </div>
        )}
      </header>
    </>
  );
}
