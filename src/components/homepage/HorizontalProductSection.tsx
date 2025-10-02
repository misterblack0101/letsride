'use client';

import { ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import ProductCard from '@/components/products/ProductCard';
import type { Product } from '@/lib/models/Product';

interface HorizontalProductSectionProps {
    title: string;
    products: Product[];
    viewAllLink?: string;
    showShopAll?: boolean;
}

/**
 * Horizontal scrolling product section component for homepage.
 * 
 * **Features:**
 * - Horizontal scroll on mobile and desktop
 * - Uses existing ProductCard component in grid mode
 * - Optional "View All" button with custom link
 * - Responsive layout with proper spacing
 * 
 * **Performance:**
 * - Client component for smooth horizontal scrolling
 * - Optimized for touch devices
 * - Prevents layout shift with consistent card sizes
 * 
 * @param title - Section title (e.g., "Top Bikes")
 * @param products - Array of products to display
 * @param viewAllLink - Optional link for "View All" button
 * @param showShopAll - Whether to show the "View All" button
 * 
 * @example
 * ```tsx
 * <HorizontalProductSection
 *   title="Top Bikes"
 *   products={topBikes}
 *   viewAllLink="/products/bikes"
 *   showShopAll={true}
 * />
 * ```
 */
export default function HorizontalProductSection({
    title,
    products,
    viewAllLink,
    showShopAll = true
}: HorizontalProductSectionProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [showNavButtons, setShowNavButtons] = useState(false);

    // Check if navigation buttons should be shown
    useEffect(() => {
        const checkScrollButtons = () => {
            if (scrollContainerRef.current) {
                const container = scrollContainerRef.current;
                const isMobile = window.innerWidth < 768;

                // Show buttons always on mobile, or when more than 4 items on desktop
                const shouldShow = isMobile || products.length > 4;
                setShowNavButtons(shouldShow);

                if (shouldShow) {
                    setCanScrollLeft(container.scrollLeft > 0);
                    setCanScrollRight(
                        container.scrollLeft < container.scrollWidth - container.clientWidth
                    );
                }
            }
        };

        checkScrollButtons();
        window.addEventListener('resize', checkScrollButtons);

        return () => window.removeEventListener('resize', checkScrollButtons);
    }, [products.length]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            const newScrollLeft = scrollContainerRef.current.scrollLeft +
                (direction === 'left' ? -scrollAmount : scrollAmount);

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            setCanScrollLeft(container.scrollLeft > 0);
            setCanScrollRight(
                container.scrollLeft < container.scrollWidth - container.clientWidth
            );
        }
    };

    // Don't render section if no products
    if (products.length === 0) {
        return null;
    }

    return (
        <section className="py-0 pb-0">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    {title}
                </h2>
                {showShopAll && viewAllLink && (
                    <Link
                        href={viewAllLink}
                        className="flex items-center gap-2 text-base font-semibold text-gray-600 hover:text-primary transition-colors group px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                        View All
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>

            {/* Horizontal Scrolling Products */}
            <div className="relative">
                {/* Left Navigation Button */}
                {showNavButtons && canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                )}

                {/* Right Navigation Button */}
                {showNavButtons && canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-6 h-6 text-gray-600" />
                    </button>
                )}

                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex gap-2 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide horizontal-scroll snap-x"
                >
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="flex-none w-48 sm:w-56 md:w-64 lg:w-72 snap-start"
                        >
                            <ProductCard product={product} viewMode="grid" />
                        </div>
                    ))}

                    {/* Spacer for better scroll experience */}
                    <div className="flex-none w-4" />
                </div>
            </div>
        </section>
    );
}