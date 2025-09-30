// app/products/[category]/page.tsx
import { fetchFilteredProducts } from '@/lib/server/products.server'; // server-only
import { getProductCount } from '@/lib/server/product-count'; // Import count function
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
    page?: string;
    lastId?: string;
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

    // Parse and validate search parameters using our utility
    const {
        brands = [], // Renamed to match our expected prop name
        minPrice,
        maxPrice,
        sortBy = 'rating',
        viewMode = 'grid',
        page = 1,
        lastId
    } = parseProductFilterParams(awaitedSearchParams as Record<string, string | string[]>);

    const pageSize = 24; // Number of products per page
    // Pagination logic: hybrid cursor and offset-based
    const startAfterId = page > 1 && lastId ? lastId : undefined;
    const useOffsetPagination = page > 1 && !lastId;

    // Always filter by the current category
    const products = await fetchFilteredProducts({
        categories: [decodedCategory],
        brands: brands.length > 0 ? brands : undefined,
        minPrice,
        maxPrice,
        sortBy: sortBy as 'name' | 'price_low' | 'price_high' | 'rating',
        pageSize,
        startAfterId,
        offset: useOffsetPagination ? (page - 1) * pageSize : undefined,
    });

    // Get the total count for pagination using a proper count query
    const totalCount = await getProductCount({
        category: decodedCategory,
        brands: brands.length > 0 ? brands : undefined,
        minPrice,
        maxPrice
    });    // Get subcategories and brands specific to this category
    const { subcategoriesByCategory } = await getCategoriesFromDB();
    const subcategories = subcategoriesByCategory[decodedCategory] || [];

    // Get brands specific to this category
    const categoryBrands = await getBrandsForCategory(decodedCategory);

    // Get the ID of the last product for cursor-based pagination
    const lastProductId = products.length > 0 ? products[products.length - 1].id : undefined;

    return (
        <ProductPage
            title={decodedCategory}
            description={`Find the perfect ${decodedCategory.toLowerCase()} for your cycling adventures.`}
            products={products}
            availableBrands={categoryBrands}
            currentCategory={decodedCategory}
            currentSubcategories={subcategories}
            selectedBrands={brands}
            selectedMinPrice={minPrice}
            selectedMaxPrice={maxPrice}
            sortBy={sortBy as 'name' | 'price_low' | 'price_high' | 'rating'}
            viewMode={viewMode as 'grid' | 'list'}
            totalCount={totalCount}
            currentPage={page}
            pageSize={pageSize}
            lastProductId={lastProductId}
        />
    );
}