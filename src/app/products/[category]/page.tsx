// app/products/[category]/page.tsx
import { fetchFilteredProducts } from '@/lib/server/products.server'; // server-only
import { getCategoriesFromDB, getBrandsForCategory } from '@/lib/services/categories';
import ProductPage from '@/components/products/ProductPage';
import { parseProductFilterParams, findCorrectCategory } from '@/lib/utils/search-params';
import { notFound } from 'next/navigation';
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

    // Get available categories to find the correct case
    const { subcategoriesByCategory } = await getCategoriesFromDB();
    const availableCategories = Object.keys(subcategoriesByCategory);
    const correctCategory = findCorrectCategory(decodedCategory, availableCategories) || decodedCategory;

    return {
        title: `${correctCategory} Products | Let's Ride`,
        description: `Shop from our collection of ${correctCategory.toLowerCase()} for cycling. Find the perfect gear for your next adventure.`,
        openGraph: {
            title: `${correctCategory} Products | Let's Ride`,
            description: `Shop from our collection of ${correctCategory.toLowerCase()} for cycling. Find the perfect gear for your next adventure.`,
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

    // Get available categories to find the correct case
    const categoriesData = await getCategoriesFromDB();
    const availableCategories = Object.keys(categoriesData.subcategoriesByCategory);

    // Find the correctly cased category name
    const correctCategory = findCorrectCategory(decodedCategory, availableCategories);

    // If category doesn't exist, show 404
    if (!correctCategory) {
        notFound();
    }

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

    // Fetch initial batch for SSR (filter by correct category name)
    const initialBatch = await fetchFilteredProducts({
        categories: [correctCategory],
        brands: brands.length > 0 ? brands : undefined,
        minPrice,
        maxPrice,
        sortBy: sortBy as 'name' | 'price_low' | 'price_high' | 'rating',
        pageSize: 24
    });

    // Get subcategories for this category
    const subcategories = categoriesData.subcategoriesByCategory[correctCategory] || [];

    // Get brands specific to this category
    const categoryBrands = await getBrandsForCategory(correctCategory);

    // Build filter object for client-side infinite scroll
    const filters = {
        categories: [correctCategory],
        brands: brands.length > 0 ? brands : undefined,
        minPrice,
        maxPrice,
        sortBy: sortBy as 'name' | 'price_low' | 'price_high' | 'rating'
    };

    return (
        <ProductPage
            title={`${correctCategory} Section`}
            description={correctCategory.toLowerCase() === 'kids'
                ? 'Find the perfect kids products from our collection.'
                : `Find the perfect ${correctCategory.toLowerCase()} for your cycling adventures.`
            }
            initialProducts={initialBatch.products}
            availableBrands={categoryBrands}
            availableCategories={[]}
            selectedCategories={[]}
            currentCategory={correctCategory}
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