// app/products/[category]/[subcategory]/page.tsx
import { getFilteredProductsViaCategory } from '@/lib/server/products.server'; // server-only
import { getProductCount } from '@/lib/server/product-count'; // Import the count function
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
        page?: string;
        lastId?: string;
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

export default async function SubcategoryPage({ params, searchParams }: Props) {
    // Await params before accessing its properties
    const { category, subcategory } = await params;
    const decodedCategory = decodeURIComponent(category);
    const decodedSubcategory = decodeURIComponent(subcategory);

    // Prepare searchParams for future use
    const awaitedSearchParams = await searchParams;

    // Parse and validate search parameters using our utility
    const {
        brands,
        minPrice,
        maxPrice,
        sortBy,
        viewMode,
        page,
        lastId
    } = parseProductFilterParams(awaitedSearchParams as Record<string, string | string[]>);

    const pageSize = 12; // Number of products per page
    const startAfterId = page > 1 && lastId ? lastId : undefined;

    // Get products for this category/subcategory combination with any additional filters
    const products = await getFilteredProductsViaCategory(
        decodedCategory,
        decodedSubcategory,
        {
            sortBy,
            brands: brands.length > 0 ? brands : undefined,
            minPrice,
            maxPrice,
            pageSize,
            startAfterId
        }
    );

    // Get the total count for pagination using a proper count query
    const totalCount = await getProductCount({
        category: decodedCategory,
        subcategory: decodedSubcategory,
        brands: brands.length > 0 ? brands : undefined,
        minPrice,
        maxPrice
    });

    // Get the specific brands for this subcategory
    const subcategoryBrands = await getBrandsForSubcategory(decodedCategory, decodedSubcategory);

    // Get the ID of the last product for cursor-based pagination
    const lastProductId = products.length > 0 ? products[products.length - 1].id : undefined;

    return (
        <ProductPage
            title={decodedSubcategory}
            description={`Shop our collection of ${decodedSubcategory.toLowerCase()} in the ${decodedCategory.toLowerCase()} category.`}
            products={products}
            availableBrands={subcategoryBrands}
            currentCategory={decodedCategory}
            currentSubcategory={decodedSubcategory}
            selectedBrands={brands}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sortBy={sortBy}
            viewMode={viewMode}
            totalCount={totalCount}
            currentPage={page}
            pageSize={pageSize}
        />
    );
}
