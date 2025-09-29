import { fetchProducts, fetchFilteredProducts } from '@/lib/server/products.server';
import { getProductCount } from '@/lib/server/product-count';
import { getCategoriesFromDB } from '@/lib/services/categories';
import ProductPage from '@/components/products/ProductPage';
import type { Metadata } from 'next';

interface SearchParams {
  category?: string | string[];
  brand?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  view?: string;
  page?: string;
}

interface StorePageProps {
  searchParams: Promise<SearchParams>;
}

// Generate dynamic metadata based on search parameters
export async function generateMetadata({ searchParams }: StorePageProps): Promise<Metadata> {
  const params = await searchParams;

  const categories = Array.isArray(params.category)
    ? params.category
    : params.category ? [params.category] : [];

  const brands = Array.isArray(params.brand)
    ? params.brand
    : params.brand ? [params.brand] : [];

  let title = 'Bike Store - Premium Bicycles and Cycling Gear';
  let description = 'Discover our complete collection of premium bicycles, cycling gear, and accessories. Find the perfect ride for your next adventure.';

  if (categories.length > 0 || brands.length > 0) {
    const filterParts = [];
    if (categories.length > 0) {
      filterParts.push(categories.join(', '));
    }
    if (brands.length > 0) {
      filterParts.push(brands.join(', '));
    }

    title = `${filterParts.join(' - ')} | Bike Store`;
    description = `Shop ${filterParts.join(' and ')} at our bike store. ${description}`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const params = await searchParams;

  // Parse search parameters
  const categories = Array.isArray(params.category)
    ? params.category
    : params.category ? [params.category] : [];

  const brands = Array.isArray(params.brand)
    ? params.brand
    : params.brand ? [params.brand] : [];

  const sortBy = (params.sort as 'name' | 'price_low' | 'price_high' | 'rating') || 'rating';
  const viewMode = (params.view as 'grid' | 'list') || 'grid';
  const page = params.page ? parseInt(params.page) : 1;
  const pageSize = 12; // Number of products per page

  // Calculate pagination offsets
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Use enhanced filtering for better performance
  const hasFilters = categories.length > 0 || brands.length > 0;

  // Get product count for pagination
  const totalCount = await getProductCount({
    category: categories.length > 0 ? categories[0] : undefined,
    brands: brands.length > 0 ? brands : undefined
  });

  // Fetch filtered products with pagination
  const [filteredProducts, allProducts] = await Promise.all([
    fetchFilteredProducts({
      categories: categories.length > 0 ? categories : undefined,
      brands: brands.length > 0 ? brands : undefined,
      sortBy,
      pageSize: pageSize,
      // We could use startAfterId for cursor-based pagination, but we don't have it for the first page
    }),
    // Always fetch all products for filter options (no pagination)
    fetchProducts()
  ]);

  // If no filters were applied, use the same data for both
  const productsToShow = hasFilters ? filteredProducts : filteredProducts;

  // Get structured category data from our cached service
  const { allBrands } = await getCategoriesFromDB();

  return (
    <ProductPage
      title="Explore Our Collection"
      description="Find the perfect ride and gear for your next adventure."
      products={productsToShow}
      availableBrands={allBrands}
      selectedBrands={brands}
      sortBy={sortBy}
      viewMode={viewMode}
      totalCount={totalCount}
      currentPage={page}
      pageSize={pageSize}
    />
  );
}