// src/components/products/ProductPage.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import ProductGrid from '@/components/products/ProductGrid';
import ServerProductSort from '@/components/products/ServerProductSort';
import ServerViewToggle from '@/components/products/ServerViewToggle';
import ServerProductFilters from '@/components/products/ServerProductFilters';
import { ProductGridSkeleton } from '@/components/ui/loading';
import type { Product } from '@/lib/models/Product';
import type { ProductFilterOptions } from '@/lib/services/products';

/**
 * Props interface for the main ProductPage component with infinite scroll.
 * 
 * **Migration from Pagination:**
 * - Removed pagination-related props (totalCount, currentPage, pageSize, lastProductId)
 * - Added initialProducts for SSR hydration
 * - Added filters object for client-side infinite scroll
 * - Simplified component architecture
 * 
 * @interface ProductPageProps
 */
interface ProductPageProps {
    /** Page title displayed in the header */
    title: string;
    /** Page description displayed below the title */
    description: string;
    /** Initial products from SSR for immediate display */
    initialProducts?: Product[];
    /** Filter configuration for infinite scroll */
    filters: ProductFilterOptions;
    /** Available brand options for the filter sidebar */
    availableBrands: string[];
    /** Available category options for the filter sidebar (used in general product pages) */
    availableCategories: string[];
    /** Currently selected categories */
    selectedCategories: string[];
    /** Current category context (for category-specific pages) */
    currentCategory?: string;
    /** Current subcategory context (for subcategory-specific pages) */
    currentSubcategory?: string;
    /** Available subcategories in the current category */
    currentSubcategories?: string[];
    /** Currently selected brands in the filter */
    selectedBrands: string[];
    /** Current minimum price filter value */
    selectedMinPrice?: number;
    /** Current maximum price filter value */
    selectedMaxPrice?: number;
    /** Current sort order applied to products */
    sortBy: 'name' | 'price_low' | 'price_high' | 'rating';
    /** Current view mode (grid or list layout) */
    viewMode: 'grid' | 'list';
}

/**
 * Main product listing page with infinite scroll optimization.
 * 
 * **Architecture Changes:**
 * - Removed pagination UI and related complexity
 * - ProductGrid now handles infinite scroll internally
 * - Simplified props interface focusing on filter state
 * - Better SSR with initial product batch
 * 
 * **Cost Benefits:**
 * - No expensive totalCount queries
 * - Eliminated page-based navigation overhead
 * - Cursor-based pagination reduces Firestore reads significantly
 * - Simpler component tree improves rendering performance
 */
export default function ProductPage({
    title,
    description,
    initialProducts,
    filters,
    availableBrands,
    availableCategories,
    selectedCategories,
    currentCategory,
    currentSubcategory,
    currentSubcategories,
    selectedBrands,
    selectedMinPrice,
    selectedMaxPrice,
    sortBy,
    viewMode
}: ProductPageProps) {
    return (
        <div className="container mx-auto px-4 pt-0 pb-3">
            <h1 className="text-4xl font-bold font-headline text-center mb-1">{title}</h1>
            <p className="text-lg text-muted-foreground text-center mb-6">
                {description}
            </p>

            {/* Mobile Filters Button */}
            <div className="block lg:hidden mb-6">
                <ServerProductFilters
                    availableBrands={availableBrands}
                    availableCategories={availableCategories}
                    selectedCategories={selectedCategories}
                    selectedBrands={selectedBrands}
                    selectedMinPrice={selectedMinPrice}
                    selectedMaxPrice={selectedMaxPrice}
                    currentCategory={currentCategory}
                    currentSubcategory={currentSubcategory}
                    currentSubcategories={currentSubcategories}
                />
            </div>

            <div className="flex gap-8">
                {/* Desktop Filters Sidebar */}
                <div className="hidden lg:block w-64 flex-shrink-0">
                    <ServerProductFilters
                        availableBrands={availableBrands}
                        availableCategories={availableCategories}
                        selectedCategories={selectedCategories}
                        selectedBrands={selectedBrands}
                        selectedMinPrice={selectedMinPrice}
                        selectedMaxPrice={selectedMaxPrice}
                        currentCategory={currentCategory}
                        currentSubcategory={currentSubcategory}
                        currentSubcategories={currentSubcategories}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        {/* Enhanced breadcrumb display */}
                        <div className="flex flex-col gap-1">
                            {currentCategory && currentSubcategory ? (
                                <>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Currently Browsing
                                    </span>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Link
                                            href="/products"
                                            className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                                        >
                                            All Products
                                        </Link>
                                        <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <Link
                                            href={`/products/${encodeURIComponent(currentCategory)}`}
                                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium hover:bg-gray-200 hover:text-primary transition-colors cursor-pointer"
                                        >
                                            {currentCategory}
                                        </Link>
                                        <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <span className="bg-primary/20 text-primary px-2 py-1 rounded-md font-medium">
                                            {currentSubcategory}
                                        </span>
                                    </div>
                                </>
                            ) : currentCategory && !currentSubcategory ? (
                                <>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Link
                                            href="/products"
                                            className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            All Products
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="h-12" aria-hidden="true"></div>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                            <div className="flex-1 sm:flex-initial">
                                <ServerProductSort currentSort={sortBy} />
                            </div>
                            <ServerViewToggle currentView={viewMode} />
                        </div>
                    </div>

                    {/* Infinite Scroll Products Grid */}
                    <ProductGrid
                        initialProducts={initialProducts}
                        filters={filters}
                        viewMode={viewMode}
                    />
                </div>
            </div>
        </div>
    );
}