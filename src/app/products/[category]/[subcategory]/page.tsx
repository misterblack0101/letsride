// app/products/[category]/[subcategory]/page.tsx
import { getFilteredProductsViaCategory } from '@/lib/server/products.server'; // server-only
import { getBrandsForSubcategory } from '@/lib/services/categories'; // Get brands for the specific subcategory
import ClientProducts from '../../ClientProducts';
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

export default async function SubcategoryPage({ params, searchParams }: Props) {
    // Await params before accessing its properties
    const { category, subcategory } = await params;
    const decodedCategory = decodeURIComponent(category);
    const decodedSubcategory = decodeURIComponent(subcategory);

    // Prepare searchParams for future use
    const awaitedSearchParams = await searchParams;

    // Parse search parameters
    const brands = Array.isArray(awaitedSearchParams.brand)
        ? awaitedSearchParams.brand
        : awaitedSearchParams.brand ? [awaitedSearchParams.brand] : [];

    const minPrice = awaitedSearchParams.minPrice ? parseInt(awaitedSearchParams.minPrice) : undefined;
    const maxPrice = awaitedSearchParams.maxPrice ? parseInt(awaitedSearchParams.maxPrice) : undefined;
    const sortBy = (awaitedSearchParams.sort as 'name' | 'price_low' | 'price_high' | 'rating') || 'rating';
    const viewMode = (awaitedSearchParams.view as 'grid' | 'list') || 'grid';

    // Get products for this category/subcategory combination with any additional filters
    const products = await getFilteredProductsViaCategory(
        decodedCategory,
        decodedSubcategory,
        {
            sortBy,
            // Add other filter options as needed
            // brands: brands.length > 0 ? brands : undefined,
        }
    );

    // Get the specific brands for this subcategory
    const subcategoryBrands = await getBrandsForSubcategory(decodedCategory, decodedSubcategory);

    return (
        <ClientProducts
            initialProducts={products}
            category={decodedCategory}
            subcategory={decodedSubcategory}
            availableBrands={subcategoryBrands}
        />
    );
}
