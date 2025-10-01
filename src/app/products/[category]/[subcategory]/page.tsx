// app/products/[category]/[subcategory]/page.tsx
import { getFilteredProductsViaCategory } from '@/lib/server/products.server'; // server-only
import { getBrandsForSubcategory } from '@/lib/services/categories'; // Get brands for the specific subcategory
import { parseProductFilterParams } from '@/lib/utils/search-params';
import ProductPage from '@/components/products/ProductPage';
import type { Metadata } from 'next';

type Props = {
    params: {
        category: string;
        subcategory: string;
    };
    searchParams: {
        brand?: string | string[];
        minPrice?: string;
        maxPrice?: string;
        sort?: string;
        view?: string;
    };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category, subcategory } = await params;
    const decodedCategory = decodeURIComponent(category);
    const decodedSubcategory = decodeURIComponent(subcategory);

    return {
        title: `${decodedSubcategory} - ${decodedCategory} | Let's Ride`,
        description: `Shop our collection of ${decodedSubcategory.toLowerCase()} in the ${decodedCategory.toLowerCase()} category. Find the perfect gear for your cycling adventure.`,
        openGraph: {
            title: `${decodedSubcategory} - ${decodedCategory} | Let's Ride`,
            description: `Shop our collection of ${decodedSubcategory.toLowerCase()} in the ${decodedCategory.toLowerCase()} category.`,
            type: 'website',
        },
    };
}

/**
 * Category/Subcategory page with infinite scroll optimization.
 * 
 * **Cost Optimization Changes:**
 * - Removed expensive product counting queries
 * - Eliminated pagination-related complexity
 * - Fetches only initial batch for SSR (24 products)
 * - Client-side infinite scroll handles subsequent loads
 * 
 * **Performance Benefits:**
 * - Faster page load with fewer Firestore reads
 * - Better SEO with actual content in SSR
 * - Smooth infinite scroll UX
 * - Category-specific filtering optimized for cursor pagination
 */
export default async function SubcategoryPage({ params, searchParams }: Props) {
    // Await params before accessing its properties
    const { category, subcategory } = await params;
    const decodedCategory = decodeURIComponent(category);
    const decodedSubcategory = decodeURIComponent(subcategory);

    // Prepare searchParams for future use
    const awaitedSearchParams = await searchParams;

    // Parse and validate search parameters using our utility
    const {
        brands = [],
        minPrice,
        maxPrice,
        sortBy = 'rating',
        viewMode = 'grid'
    } = parseProductFilterParams(awaitedSearchParams as Record<string, string | string[]>);

    // Fetch initial batch for SSR (first 24 products)
    const initialBatch = await getFilteredProductsViaCategory(
        decodedCategory,
        decodedSubcategory,
        {
            sortBy: sortBy as 'name' | 'price_low' | 'price_high' | 'rating',
            pageSize: 24,
            brands: brands.length > 0 ? brands : undefined,
            minPrice,
            maxPrice
        }
    );

    // Get the specific brands for this subcategory
    const subcategoryBrands = await getBrandsForSubcategory(decodedCategory, decodedSubcategory);

    // Build filter object for client-side infinite scroll
    const filters = {
        category: decodedCategory,
        subcategory: decodedSubcategory,
        brands: brands.length > 0 ? brands : undefined,
        minPrice,
        maxPrice,
        sortBy: sortBy as 'name' | 'price_low' | 'price_high' | 'rating'
    };

    return (
        <ProductPage
            title={decodedSubcategory}
            description={`Shop our collection of ${decodedSubcategory.toLowerCase()} in the ${decodedCategory.toLowerCase()} category.`}
            initialProducts={initialBatch.products}
            availableBrands={subcategoryBrands}
            currentCategory={decodedCategory}
            currentSubcategory={decodedSubcategory}
            selectedBrands={brands}
            selectedMinPrice={minPrice}
            selectedMaxPrice={maxPrice}
            sortBy={sortBy as 'name' | 'price_low' | 'price_high' | 'rating'}
            viewMode={viewMode as 'grid' | 'list'}
            filters={filters}
        />
    );
}
