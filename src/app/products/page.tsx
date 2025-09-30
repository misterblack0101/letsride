import { fetchProducts, fetchFilteredProducts } from '@/lib/server/products.server';
import { getProductCount } from '@/lib/server/product-count';
import { getCategoriesFromDB } from '@/lib/services/categories';
import ProductPage from '@/components/products/ProductPage';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

interface SearchParams {
  category?: string | string[];
  brand?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  view?: string;
  page?: string;
  lastId?: string;
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

  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const sortBy = (params.sort as 'name' | 'price_low' | 'price_high' | 'rating') || 'rating';
  const viewMode = (params.view as 'grid' | 'list') || 'grid';
  const page = params.page ? parseInt(params.page) : 1;
  const pageSize = 24; // Number of products per page

  // For cursor-based pagination: use lastId when page > 1 AND lastId is provided
  // Otherwise, use offset-based pagination for page jumps or going backwards
  const startAfterId = page > 1 && params.lastId ? params.lastId : undefined;
  const useOffsetPagination = page > 1 && !params.lastId;

  // Use enhanced filtering for better performance (no category filtering on main page)
  const hasFilters = brands.length > 0 || minPrice !== undefined || maxPrice !== undefined;

  // Get product count for pagination (no category filter on main page)
  const totalCount = await getProductCount({
    brands: brands.length > 0 ? brands : undefined,
    minPrice,
    maxPrice
  });

  // Fetch filtered products with pagination (no category filter on main page)
  const [filteredProducts, allProducts] = await Promise.all([
    fetchFilteredProducts({
      brands: brands.length > 0 ? brands : undefined,
      minPrice,
      maxPrice,
      sortBy,
      pageSize: pageSize,
      startAfterId, // Use cursor-based pagination when available
      offset: useOffsetPagination ? (page - 1) * pageSize : undefined, // Use offset-based pagination for page jumps
    }),
    // Always fetch all products for filter options (no pagination)
    fetchProducts()
  ]);

  // Use the filtered products for display (they respect pagination and filters)
  const productsToShow = filteredProducts;

  // Get the ID of the last product for cursor-based pagination
  const lastProductId = productsToShow.length > 0 ? productsToShow[productsToShow.length - 1].id : undefined;

  // Get structured category data from our cached service
  const { allBrands } = await getCategoriesFromDB();

  return (
    <ProductPage
      title="Explore Our Collection"
      description="Find the perfect ride and gear for your next adventure."
      products={productsToShow}
      availableBrands={allBrands}
      selectedBrands={brands}
      selectedMinPrice={minPrice}
      selectedMaxPrice={maxPrice}
      sortBy={sortBy}
      viewMode={viewMode}
      totalCount={totalCount}
      currentPage={page}
      pageSize={pageSize}
      lastProductId={lastProductId}
    />
  );
}