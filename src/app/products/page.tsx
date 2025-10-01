import { fetchFilteredProducts } from '@/lib/server/products.server';
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

/**
 * Products page with infinite scroll optimization.
 * 
 * **Cost Optimization Strategy:**
 * - Fetches only initial batch for SSR (typically 24 products)
 * - Client-side infinite scroll handles subsequent loads
 * - Eliminated expensive page counting and offset calculations
 * - Removed pagination UI and related complexity
 * 
 * **Performance Benefits:**
 * - Faster initial page load (fewer Firestore reads)
 * - Better SEO with actual product content in SSR
 * - Smoother UX with infinite scroll
 * - Significant cost reduction from cursor-based pagination
 */
export default async function StorePage({ searchParams }: StorePageProps) {
  const params = await searchParams;

  // Parse search parameters
  const brands = Array.isArray(params.brand)
    ? params.brand
    : params.brand ? [params.brand] : [];

  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const sortBy = (params.sort as 'name' | 'price_low' | 'price_high' | 'rating') || 'rating';
  const viewMode = (params.view as 'grid' | 'list') || 'grid';

  // Fetch initial batch for SSR (first 24 products)
  const initialBatch = await fetchFilteredProducts({
    brands: brands.length > 0 ? brands : undefined,
    minPrice,
    maxPrice,
    sortBy,
    pageSize: 24 // First batch size
  });

  // Get structured category data from our cached service
  const { allBrands } = await getCategoriesFromDB();

  // Build filter object for client-side infinite scroll
  const filters = {
    brands: brands.length > 0 ? brands : undefined,
    minPrice,
    maxPrice,
    sortBy
  };

  return (
    <ProductPage
      title="Explore Our Collection"
      description="Find the perfect ride and gear for your next adventure."
      initialProducts={initialBatch.products}
      availableBrands={allBrands}
      selectedBrands={brands}
      selectedMinPrice={minPrice}
      selectedMaxPrice={maxPrice}
      sortBy={sortBy}
      viewMode={viewMode}
      filters={filters}
    />
  );
}