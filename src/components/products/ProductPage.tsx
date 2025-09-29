// src/components/products/ProductPage.tsx
import { Suspense } from 'react';
import ProductGrid from '@/components/products/ProductGrid';
import ServerProductSort from '@/components/products/ServerProductSort';
import ServerViewToggle from '@/components/products/ServerViewToggle';
import ServerProductFilters from '@/components/products/ServerProductFilters';
import ServerPagination from '@/components/products/ServerPagination';
import { ProductGridSkeleton } from '@/components/ui/loading';
import type { Product } from '@/lib/models/Product';

interface ProductPageProps {
    title: string;
    description: string;
    products: Product[];
    availableBrands: string[];
    currentCategory?: string;
    currentSubcategory?: string;
    currentSubcategories?: string[];
    selectedBrands: string[];
    sortBy: 'name' | 'price_low' | 'price_high' | 'rating';
    viewMode: 'grid' | 'list';
    totalCount: number;
    currentPage: number;
    pageSize: number;
}export default function ProductPage({
    title,
    description,
    products,
    availableBrands,
    currentCategory,
    currentSubcategory,
    currentSubcategories,
    selectedBrands,
    sortBy,
    viewMode,
    totalCount,
    currentPage,
    pageSize
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
                        currentCategory={currentCategory}
                        currentSubcategory={currentSubcategory}
                        currentSubcategories={currentSubcategories}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <p className="text-sm text-muted-foreground order-2 sm:order-1">
                            Showing {Math.min(pageSize * (currentPage - 1) + 1, totalCount)} to {Math.min(pageSize * currentPage, totalCount)} of {totalCount} products
                            {currentSubcategory ? ` in ${currentSubcategory}` : currentCategory ? ` in ${currentCategory}` : ''}
                        </p>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                            <div className="flex-1 sm:flex-initial">
                                <ServerProductSort currentSort={sortBy} />
                            </div>
                            <ServerViewToggle currentView={viewMode} />
                        </div>
                    </div>

                    {/* Products Grid */}
                    <Suspense fallback={<ProductGridSkeleton />}>
                        <ProductGrid products={products} viewMode={viewMode} />
                    </Suspense>

                    {/* Pagination */}
                    <ServerPagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(totalCount / pageSize)}
                        totalItems={totalCount}
                        pageSize={pageSize}
                    />
                </div>
            </div>
        </div>
    );
}