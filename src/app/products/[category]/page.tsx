// app/products/[category]/page.tsx
import { fetchFilteredProducts } from '@/lib/server/products.server'; // server-only
import { getCategoriesFromDB, getBrandsForCategory } from '@/lib/services/categories';
import ProductGrid from '@/components/products/ProductGrid';
import ServerProductSort from '@/components/products/ServerProductSort';
import ServerViewToggle from '@/components/products/ServerViewToggle';
import ServerProductFilters from '@/components/products/ServerProductFilters';
import { Suspense } from 'react';
import { ProductGridSkeleton } from '@/components/ui/loading';
import type { Metadata } from 'next';

interface SearchParams {
    brand?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    view?: string;
}

interface CategoryPageProps {
    params: {
        category: string;
    };
    searchParams: SearchParams;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);

    return {
        title: `${decodedCategory} Products | Let's Ride`,
        description: `Shop our collection of ${decodedCategory.toLowerCase()} for cycling. Find the perfect gear for your next adventure.`,
        openGraph: {
            title: `${decodedCategory} Products | Let's Ride`,
            description: `Shop our collection of ${decodedCategory.toLowerCase()} for cycling. Find the perfect gear for your next adventure.`,
            type: 'website',
        },
    };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);

    // Need to await searchParams in Next.js server components
    const awaitedSearchParams = await searchParams;

    // Parse search parameters
    const brands = Array.isArray(awaitedSearchParams.brand)
        ? awaitedSearchParams.brand
        : awaitedSearchParams.brand ? [awaitedSearchParams.brand] : [];

    const minPrice = awaitedSearchParams.minPrice ? parseInt(awaitedSearchParams.minPrice) : undefined;
    const maxPrice = awaitedSearchParams.maxPrice ? parseInt(awaitedSearchParams.maxPrice) : undefined;
    const sortBy = (awaitedSearchParams.sort as 'name' | 'price_low' | 'price_high' | 'rating') || 'rating';
    const viewMode = (awaitedSearchParams.view as 'grid' | 'list') || 'grid';

    // Always filter by the current category
    const products = await fetchFilteredProducts({
        categories: [decodedCategory],
        brands: brands.length > 0 ? brands : undefined,
        minPrice,
        maxPrice,
        sortBy
    });

    // Get subcategories and brands specific to this category
    const { subcategoriesByCategory } = await getCategoriesFromDB();
    const subcategories = subcategoriesByCategory[decodedCategory] || [];

    // Get brands specific to this category
    const categoryBrands = await getBrandsForCategory(decodedCategory);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold font-headline text-center mb-2">{decodedCategory}</h1>
            <p className="text-lg text-muted-foreground text-center mb-8">
                Find the perfect {decodedCategory.toLowerCase()} for your cycling adventures.
            </p>

            {/* Mobile Filters Button */}
            <div className="block lg:hidden mb-6">
                <ServerProductFilters
                    availableBrands={categoryBrands}
                    availableCategories={[]}
                    selectedCategories={[]}
                    selectedBrands={brands}
                    priceRange={[minPrice || 0, maxPrice || 120000]}
                    currentCategory={decodedCategory}
                    currentSubcategories={subcategories}
                />
            </div>

            <div className="flex gap-8">
                {/* Desktop Filters Sidebar */}
                <div className="hidden lg:block w-64 flex-shrink-0">
                    <ServerProductFilters
                        availableBrands={categoryBrands}
                        availableCategories={[]}
                        selectedCategories={[]}
                        selectedBrands={brands}
                        priceRange={[minPrice || 0, maxPrice || 120000]}
                        currentCategory={decodedCategory}
                        currentSubcategories={subcategories}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <p className="text-sm text-muted-foreground order-2 sm:order-1">
                            Showing {products.length} products in {decodedCategory}
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
                </div>
            </div>
        </div>
    );
}