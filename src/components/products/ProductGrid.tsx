'use client';

import { useMemo } from 'react';
import type { Product } from '@/lib/models/Product';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '@/components/ui/loading';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import {
  fetchFilteredProducts,
  getFilteredProductsViaCategory,
  type ProductFilterOptions,
  type InfiniteScrollResponse
} from '@/lib/services/products';

type ProductGridProps = {
  initialProducts?: Product[];
  filters: ProductFilterOptions & {
    /** Category for category-specific pages */
    category?: string;
    /** Subcategory for category-specific pages */
    subcategory?: string;
  };
  viewMode: 'grid' | 'list';
};

/**
 * Infinite scroll ProductGrid component with cost-optimized Firestore queries.
 * 
 * **Architecture:**
 * - Uses custom useInfiniteScroll hook with intersection observer
 * - Supports both general products and category-specific endpoints
 * - Appends new products to existing list (no page replacements)
 * - Shows loading shimmer at bottom during infinite loading
 * - Maintains grid/list view modes seamlessly
 * - Resets and loads fresh data when filters change
 * 
 * **Performance Benefits:**
 * - Cursor-based pagination eliminates expensive offset queries
 * - Intersection observer triggers loading before user reaches end
 * - Debounced loading prevents excessive API calls
 * - Preserves scroll position during filter changes
 * 
 * @param props - Component props
 * @param props.initialProducts - SSR products for initial render (optional)
 * @param props.filters - Current filter state (includes category/subcategory if applicable)
 * @param props.viewMode - Grid or list display mode
 */
export default function ProductGrid({ initialProducts = [], filters, viewMode }: ProductGridProps) {
  // Extract stable values to prevent fetchFunction recreation
  const { category, subcategory, ...otherFilters } = filters;

  // Create stable category identifiers
  const isCategory = Boolean(category && subcategory);
  const categoryKey = isCategory ? `${category}/${subcategory}` : null;

  // Determine which fetch function to use based on whether this is a category page
  const fetchFunction = useMemo(() => {
    if (isCategory) {
      // Category-specific fetch function
      return async (
        filterOptions: Record<string, any>,
        pageSize: number,
        startAfterId?: string
      ): Promise<InfiniteScrollResponse> => {
        return getFilteredProductsViaCategory(
          category!,
          subcategory!,
          {
            sortBy: filterOptions.sortBy,
            pageSize,
            startAfterId,
            brands: filterOptions.brands,
            minPrice: filterOptions.minPrice,
            maxPrice: filterOptions.maxPrice
          }
        );
      };
    } else {
      // General products fetch function
      return (filterOptions: Record<string, any>, pageSize: number, startAfterId?: string) =>
        fetchFilteredProducts({ ...filterOptions, pageSize, startAfterId });
    }
  }, [isCategory, categoryKey]); // Use stable identifiers instead of the objects

  // Use stable filter object for the hook
  const hookFilters = useMemo(() => otherFilters, [JSON.stringify(otherFilters)]);

  // Use infinite scroll hook
  const {
    products,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMoreRef
  } = useInfiniteScroll(
    fetchFunction,
    hookFilters,
    {
      pageSize: 24,
      rootMargin: '400px', // Load well before user reaches the end
      threshold: 0.1,
      initialData: initialProducts.length > 0 ? {
        products: initialProducts,
        hasMore: initialProducts.length >= 24, // Assume more exist if we got a full page
        lastProductId: initialProducts.length > 0 ? initialProducts[initialProducts.length - 1].id : undefined
      } : undefined
    }
  );

  // Show initial loading skeleton
  if (isLoading && products.length === 0) {
    return <ProductGridSkeleton />;
  }

  // Show error state with retry functionality
  if (error) {
    const isNetworkError = error.includes('Failed to fetch') || error.includes('Network') || error.includes('timeout');
    const isServerError = error.includes('500') || error.includes('503') || error.includes('Server');
    const isNotFound = error.includes('404') || error.includes('not found');

    return (
      <div className="text-center py-16 border-2 border-dashed border-red-200 rounded-lg bg-red-50/50">
        <div className="max-w-md mx-auto">
          {/* Error Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          {/* Error Title */}
          <h2 className="text-2xl font-semibold font-headline text-red-600 mb-2">
            {isNotFound ? 'No Products Found' :
              isNetworkError ? 'Connection Problem' :
                isServerError ? 'Service Unavailable' :
                  'Error Loading Products'}
          </h2>

          {/* Error Description */}
          <p className="text-red-600 mb-4">
            {isNotFound ? 'This category doesn\'t have any products yet.' :
              isNetworkError ? 'Please check your internet connection and try again.' :
                isServerError ? 'Our service is temporarily unavailable. Please try again in a moment.' :
                  'Something went wrong while loading products.'}
          </p>

          {/* Error Details (for debugging) */}
          <details className="text-left bg-red-100 rounded p-3 mb-4">
            <summary className="cursor-pointer text-sm font-medium text-red-700">
              Technical Details
            </summary>
            <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap">{error}</pre>
          </details>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry Loading
            </button>

            {filters.category && filters.subcategory && (
              <button
                onClick={() => window.location.href = '/products'}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Browse All Products
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!isLoading && products.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <h2 className="text-2xl font-semibold font-headline">No Products Found</h2>
        <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
      </div>
    );
  }

  const gridClasses = viewMode === 'grid'
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
    : "flex flex-col gap-4";

  return (
    <div className="space-y-6">
      {/* Product Grid */}
      <div className={gridClasses}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger & Loading State */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex justify-center py-4"
          style={{
            minHeight: '120px',
            // Reserve space for loading state to prevent layout shift
            contain: 'layout'
          }}
        >
          {isLoadingMore ? (
            <div className="space-y-4 w-full">
              {/* Loading shimmer for additional products */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-muted-foreground">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  <span>Loading more products...</span>
                </div>
              </div>

              {/* Skeleton grid for upcoming products */}
              <div className={gridClasses}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <div className="h-8 w-8 border-2 border-dashed border-current rounded-full mx-auto mb-2"></div>
              <span>Scroll for more products</span>
            </div>
          )}
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-8 text-muted-foreground border-t">
          <p>You've reached the end of the results</p>
          <p className="text-sm mt-1">{products.length} products shown</p>
        </div>
      )}
    </div>
  );
}
