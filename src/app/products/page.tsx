import { fetchProducts, fetchFilteredProducts } from '@/lib/server/products.server';
import ServerProductFilters from '@/components/products/ServerProductFilters';
import ProductGrid from '@/components/products/ProductGrid';
import ServerProductSort from '@/components/products/ServerProductSort';
import ServerViewToggle from '@/components/products/ServerViewToggle';
import { Suspense } from 'react';
import { ProductGridSkeleton } from '@/components/ui/loading';
import type { Product } from '@/lib/models/Product';
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

export default async function StorePage({ searchParams }: StorePageProps) {
  const params = await searchParams;

  // Parse search parameters
  const categories = Array.isArray(params.category)
    ? params.category
    : params.category ? [params.category] : [];

  const brands = Array.isArray(params.brand)
    ? params.brand
    : params.brand ? [params.brand] : [];

  const minPrice = params.minPrice ? parseInt(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice) : undefined;
  const sortBy = (params.sort as 'name' | 'price_low' | 'price_high' | 'rating') || 'rating';
  const viewMode = (params.view as 'grid' | 'list') || 'grid';

  // Use enhanced filtering for better performance
  const hasFilters = categories.length > 0 || brands.length > 0 || minPrice !== undefined || maxPrice !== undefined;

  const [filteredProducts, allProducts] = await Promise.all([
    hasFilters ? fetchFilteredProducts({
      categories: categories.length > 0 ? categories : undefined,
      brands: brands.length > 0 ? brands : undefined,
      minPrice,
      maxPrice,
      sortBy
    }) : fetchProducts(),
    // Always fetch all products for filter options
    fetchProducts()
  ]);

  // If no filters were applied, use the same data for both
  const productsToShow = hasFilters ? filteredProducts : allProducts.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'rating':
      default:
        return b.rating - a.rating;
    }
  });

  // Get available filter options from all products (filter out undefined values)
  const availableBrands = [...new Set(allProducts.map(p => p.brand).filter((brand): brand is string => !!brand))];
  const availableCategories = [...new Set(allProducts.map(p => p.category))];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold font-headline text-center mb-2">Explore Our Collection</h1>
      <p className="text-lg text-muted-foreground text-center mb-8">Find the perfect ride and gear for your next adventure.</p>

      {/* Mobile Filters Button */}
      <div className="block lg:hidden mb-6">
        <ServerProductFilters
          availableBrands={availableBrands}
          availableCategories={availableCategories}
          selectedCategories={categories}
          selectedBrands={brands}
          priceRange={[minPrice || 0, maxPrice || 120000]}
        />
      </div>

      <div className="flex gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <ServerProductFilters
            availableBrands={availableBrands}
            availableCategories={availableCategories}
            selectedCategories={categories}
            selectedBrands={brands}
            priceRange={[minPrice || 0, maxPrice || 120000]}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {productsToShow.length} products
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
            <ProductGrid products={productsToShow} viewMode={viewMode} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}