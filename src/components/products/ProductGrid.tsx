'use client';

import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import type { Product } from '@/lib/models/Product';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '@/components/ui/loading';
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
 * ProductGrid component with optimized manual fetch functionality.
 * 
 * **Architecture:**
 * - State-based product loading with memoized functions to prevent infinite loops
 * - Supports both general products (/api/products) and category-specific endpoints (/api/products/category/[cat]/[subcat])
 * - Manual "Load More" button with loading states and shimmer UI
 * - Automatic filter change detection and data reset
 * - Grid/list view mode support with memoized CSS classes
 * - Proper React hook ordering to prevent "fewer hooks than expected" errors
 * 
 * **Performance Optimizations:**
 * - useCallback for loadMore and resetAndLoad functions
 * - useMemo for memoizedFilters to prevent unnecessary API calls
 * - useMemo for fetchFunction based on category/subcategory detection
 * - useMemo for gridClasses to prevent unnecessary re-renders
 * - useRef for initialization tracking to prevent infinite loops
 * 
 * **State Management:**
 * - products: Current product list (initially from SSR, then from API)
 * - isLoading: Initial load state (shows skeleton)
 * - isLoadingMore: Pagination load state (shows shimmer)
 * - error: Error state with retry functionality
 * - hasMore: Pagination state
 * - isFilterChanging: External filter change events (from ServerProductFilters)
 * 
 * **API Integration:**
 * - Detects category/subcategory context to choose correct endpoint
 * - Handles case-insensitive URL routing for categories
 * - Cursor-based pagination with lastProductId tracking
 * - Filter parameters: brands, minPrice, maxPrice, sortBy
 * 
 * @param props - Component props
 * @param props.initialProducts - SSR products for initial render (prevents unnecessary API call)
 * @param props.filters - Current filter state including category/subcategory context
 * @param props.viewMode - Display mode ('grid' | 'list') affects layout and loading skeletons
 */
export default function ProductGrid({ initialProducts = [], filters, viewMode }: ProductGridProps) {
  // Product state management
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastProductId, setLastProductId] = useState<string | undefined>();

  // Filter change loading state
  const [isFilterChanging, setIsFilterChanging] = useState(false);

  // Track if component has been initialized to prevent infinite loops
  const isInitialized = useRef(false);

  // Listen for filter change events from ServerProductFilters
  useEffect(() => {
    const handleFilterStart = () => setIsFilterChanging(true);
    const handlePriceFilterStart = () => setIsFilterChanging(true);

    window.addEventListener('filterChangeStart', handleFilterStart);
    window.addEventListener('priceFilterStart', handlePriceFilterStart);

    // Reset filter changing state when component re-renders (after navigation)
    setIsFilterChanging(false);

    return () => {
      window.removeEventListener('filterChangeStart', handleFilterStart);
      window.removeEventListener('priceFilterStart', handlePriceFilterStart);
    };
  }, [filters]); // Reset when filters actually change

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
  }, [isCategory, categoryKey, category, subcategory]);

  // Memoize otherFilters to prevent unnecessary function recreations
  const memoizedFilters = useMemo(() => otherFilters, [JSON.stringify(otherFilters)]);

  // Manual load more function
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const result = await fetchFunction(memoizedFilters, 24, lastProductId);
      setProducts(prev => [...prev, ...result.products]);
      setHasMore(result.hasMore);
      setLastProductId(result.lastProductId);
    } catch (err) {
      console.error('Error loading more products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchFunction, memoizedFilters, lastProductId, isLoadingMore, hasMore]);

  // Reset and load fresh data when filters change
  const resetAndLoad = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setProducts([]);
    setHasMore(true);
    setLastProductId(undefined);

    try {
      const result = await fetchFunction(memoizedFilters, 24, undefined);
      setProducts(result.products);
      setHasMore(result.hasMore);
      setLastProductId(result.lastProductId);
    } catch (err) {
      console.error('Error loading initial products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, memoizedFilters]);

  // Memoize grid classes to prevent unnecessary re-renders (MUST be before any conditional returns)
  const gridClasses = useMemo(() =>
    viewMode === 'grid'
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      : "flex flex-col gap-4"
    , [viewMode]);

  // Reset when filters change
  useEffect(() => {
    // If we have initial products and haven't initialized yet, use them
    if (initialProducts.length > 0 && !isInitialized.current) {
      setProducts(initialProducts);
      setHasMore(initialProducts.length >= 24);
      setLastProductId(initialProducts.length > 0 ? initialProducts[initialProducts.length - 1].id : undefined);
      isInitialized.current = true;
      return;
    }

    // Reset when filters change (only after initialization)
    if (isInitialized.current) {
      resetAndLoad();
    } else {
      // First time with no initial products
      isInitialized.current = true;
      resetAndLoad();
    }
  }, [memoizedFilters, isCategory, categoryKey, resetAndLoad]);

  // Show initial loading skeleton or filter change loading
  if ((isLoading && products.length === 0) || isFilterChanging) {
    return <ProductGridSkeleton viewMode={viewMode} />;
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

      {/* Load More Section */}
      {hasMore && (
        <div className="space-y-6">
          {/* Load More Button */}
          <div className="flex justify-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-gray-700"
            >
              {isLoadingMore ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  <span>Loading More...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span>Load More Products</span>
                </>
              )}
            </button>
          </div>

          {/* Loading Shimmer when loading more */}
          {isLoadingMore && (
            <div className="space-y-4">
              {/* Loading shimmer for additional products based on view mode */}
              {viewMode === 'list' ? (
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`list-shimmer-${i}`} className="bg-white rounded-lg shadow-sm border animate-pulse">
                      <div className="flex gap-4 p-4">
                        <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={gridClasses}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`grid-shimmer-${i}`} className="bg-white rounded-lg shadow-sm border animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
