// src/components/products/ProductPage.tsx
import { Suspense } from 'react';
import ProductGrid from '@/components/products/ProductGrid';
import ServerProductSort from '@/components/products/ServerProductSort';
import ServerViewToggle from '@/components/products/ServerViewToggle';
import ServerProductFilters from '@/components/products/ServerProductFilters';
import ServerPagination from '@/components/products/ServerPagination';
import { ProductGridSkeleton } from '@/components/ui/loading';
import type { Product } from '@/lib/models/Product';
import ProductCount from './ProductCount';

/**
 * Props interface for the main ProductPage component.
 * 
 * This interface defines all the data and configuration needed to render
 * a complete product listing page with filtering, sorting, and pagination.
 * 
 * @interface ProductPageProps
 */
interface ProductPageProps {
    /** Page title displayed in the header */
    title: string;
    /** Page description displayed below the title */
    description: string;
    /** Array of products to display (already filtered and paginated) */
    products: Product[];
    /** Available brand options for the filter sidebar */
    availableBrands: string[];
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
    /** Total number of products matching current filters (for pagination) */
    totalCount: number;
    /** Current page number (1-based) */
    currentPage: number;
    /** Number of products per page */
    pageSize: number;
    /** ID of the last product on current page (for cursor-based pagination) */
    lastProductId?: string;
}export default function ProductPage({
    title,
    description,
    products,
    availableBrands,
    currentCategory,
    currentSubcategory,
    currentSubcategories,
    selectedBrands,
    selectedMinPrice,
    selectedMaxPrice,
    sortBy,
    viewMode,
    totalCount,
    currentPage,
    pageSize,
    lastProductId
}: ProductPageProps) {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold font-headline text-center mb-2">{title}</h1>
            <p className="text-lg text-muted-foreground text-center mb-8">
                {description}
            </p>

            {/* Mobile Filters Button */}
            <div className="block lg:hidden mb-6">
                <ServerProductFilters
                    availableBrands={availableBrands}
                    availableCategories={[]}
                    selectedCategories={[]}
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
                        availableCategories={[]}
                        selectedCategories={[]}
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
                        <ProductCount
                            totalCount={totalCount}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            actualProductsCount={products.length}
                            currentCategory={currentCategory}
                            currentSubcategory={currentSubcategory}
                        />
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                            <div className="flex-1 sm:flex-initial">
                                <ServerProductSort currentSort={sortBy} />
                            </div>
                            <ServerViewToggle currentView={viewMode} />
                        </div>
                    </div>

                    {/* Products Grid */}
                    <ProductGrid products={products} viewMode={viewMode} />

                    {/* Pagination */}
                    <ServerPagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(totalCount / pageSize)}
                        totalItems={totalCount}
                        pageSize={pageSize}
                        lastProductId={lastProductId}
                    />
                </div>
            </div>
        </div>
    );
}