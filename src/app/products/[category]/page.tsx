// app/products/[category]/page.tsx
import { fetchFilteredProducts } from '@/lib/server/products.server'; // server-only
import { getCategoriesFromDB, getBrandsForCategory } from '@/lib/services/categories';
import ProductPage from '@/components/products/ProductPage';
import { parseProductFilterParams } from '@/lib/utils/search-params';
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

/**
 * Category page with infinite scroll optimization.
 * 
 * **Cost Optimization:**
 * - Removed expensive product counting
 * - Eliminated pagination complexity
 * - Fetches only initial batch for SSR
 * - Uses category-specific filtering for better performance
 */
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);

    // Need to await searchParams in Next.js server components
    const awaitedSearchParams = await searchParams;

    // Parse and validate search parameters using our utility
    const {
        brands = [],
        minPrice,
        maxPrice,
        sortBy = 'rating',
        viewMode = 'grid'
    } = parseProductFilterParams(awaitedSearchParams as Record<string, string | string[]>);

    // Fetch initial batch for SSR (filter by current category)
    const initialBatch = await fetchFilteredProducts({
        categories: [decodedCategory],
        brands: brands.length > 0 ? brands : undefined,
        minPrice,
        maxPrice,
        sortBy: sortBy as 'name' | 'price_low' | 'price_high' | 'rating',
        pageSize: 24
    });

    // Get subcategories and brands specific to this category
    const { subcategoriesByCategory } = await getCategoriesFromDB();
    const subcategories = subcategoriesByCategory[decodedCategory] || [];

    // Get brands specific to this category
    const categoryBrands = await getBrandsForCategory(decodedCategory);

    // Build filter object for client-side infinite scroll
    const filters = {
        categories: [decodedCategory],
        brands: brands.length > 0 ? brands : undefined,
        minPrice,
        maxPrice,
        sortBy: sortBy as 'name' | 'price_low' | 'price_high' | 'rating'
    };

    return (
        <ProductPage
            title={decodedCategory}
            description={`Find the perfect ${decodedCategory.toLowerCase()} for your cycling adventures.`}
            initialProducts={initialBatch.products}
            availableBrands={categoryBrands}
            currentCategory={decodedCategory}
            currentSubcategories={subcategories}
            selectedBrands={brands}
            selectedMinPrice={minPrice}
            selectedMaxPrice={maxPrice}
            sortBy={sortBy as 'name' | 'price_low' | 'price_high' | 'rating'}
            viewMode={viewMode as 'grid' | 'list'}
            filters={filters}
        />
    );
}