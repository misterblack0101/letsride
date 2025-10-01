'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Product } from '@/lib/models/Product';

/**
 * Configuration options for infinite scroll behavior.
 */
interface InfiniteScrollOptions {
    /** Number of items to load per batch. Default: 20 */
    pageSize?: number;
    /** Root margin for intersection observer. Default: '100px' */
    rootMargin?: string;
    /** Threshold for intersection observer. Default: 0.1 */
    threshold?: number;
    /** Enable infinite scroll. Default: true */
    enabled?: boolean;
    /** Initial data to populate the hook with (skips first fetch) */
    initialData?: {
        products: Product[];
        hasMore: boolean;
        lastProductId?: string;
    };
}

/**
 * Return type for the infinite scroll hook.
 */
interface InfiniteScrollReturn {
    /** Combined array of all loaded products */
    products: Product[];
    /** Loading state for initial load */
    isLoading: boolean;
    /** Loading state for subsequent loads */
    isLoadingMore: boolean;
    /** Error state */
    error: string | null;
    /** Whether there are more items to load */
    hasMore: boolean;
    /** Ref to attach to the loading trigger element */
    loadMoreRef: React.RefObject<HTMLDivElement>;
    /** Manual function to load more items */
    loadMore: () => void;
    /** Function to reset to initial state */
    reset: () => void;
}

/**
 * Fetch function signature for loading products.
 */
type FetchFunction = (
    filters: Record<string, any>,
    pageSize: number,
    startAfterId?: string
) => Promise<{
    products: Product[];
    hasMore: boolean;
    lastProductId?: string;
}>;

/**
 * Custom hook for infinite scrolling product lists with cost-optimized Firestore queries.
 * 
 * **Cost Optimization Strategy:**
 * - Uses cursor-based pagination exclusively (no offset queries)
 * - Maintains `startAfterId` for efficient Firestore `.startAfter()` queries
 * - Intersection Observer triggers loading before user reaches end
 * - Debounced loading to prevent excessive requests
 * 
 * **Usage:**
 * ```tsx
 * const { products, loadMoreRef, isLoadingMore, hasMore } = useInfiniteScroll(
 *   fetchProductsFunction,
 *   { brands: ['Trek'], sortBy: 'price_low' },
 *   { pageSize: 24, rootMargin: '200px' }
 * );
 * 
 * return (
 *   <div>
 *     {products.map(product => <ProductCard key={product.id} product={product} />)}
 *     {hasMore && <div ref={loadMoreRef}>Loading...</div>}
 *   </div>
 * );
 * ```
 * 
 * @param fetchFn - Function to fetch products with cursor pagination
 * @param filters - Current filter state (triggers reset when changed)
 * @param options - Configuration options for infinite scroll behavior
 * @returns Infinite scroll state and controls
 */
export function useInfiniteScroll(
    fetchFn: FetchFunction,
    filters: Record<string, any>,
    options: InfiniteScrollOptions = {}
): InfiniteScrollReturn {
    const {
        pageSize = 20,
        rootMargin = '300px', // Increased margin to load earlier and reduce jerk
        threshold = 0.1,
        enabled = true,
        initialData
    } = options;

    // State management - initialize with initial data if provided
    const [products, setProducts] = useState<Product[]>(initialData?.products || []);
    const [isLoading, setIsLoading] = useState(!initialData); // Don't show loading if we have initial data
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(initialData?.hasMore ?? true);
    const [lastProductId, setLastProductId] = useState<string | undefined>(initialData?.lastProductId);

    // Refs for intersection observer and preventing race conditions
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const isLoadingRef = useRef(false);

    // Store the latest fetch function and filters to prevent stale closures
    const fetchFnRef = useRef(fetchFn);
    const filtersRef = useRef(filters);
    const loadMoreFnRef = useRef<() => void>();
    const isInitialMount = useRef(true);

    // Update refs when props change
    useEffect(() => {
        fetchFnRef.current = fetchFn;
        filtersRef.current = filters;
    }, [fetchFn, filters]);    /**
     * Load more products using cursor-based pagination.
     * Server-side duplicates are now prevented, so we can append directly.
     * Uses requestAnimationFrame to prevent scroll jerk.
     */
    const loadMore = useCallback(async () => {
        if (isLoadingRef.current || !hasMore || !enabled) return;

        // Prevent concurrent requests
        isLoadingRef.current = true;
        setIsLoadingMore(true);
        setError(null);

        try {
            const result = await fetchFnRef.current(filtersRef.current, pageSize, lastProductId);

            // Server should not send duplicates, so we can append directly
            setProducts(prev => [...prev, ...result.products]);
            setHasMore(result.hasMore);
            setLastProductId(result.lastProductId);
        } catch (err) {
            console.error('Error loading more products:', err);
            setError(err instanceof Error ? err.message : 'Failed to load products');
        } finally {
            setIsLoadingMore(false);
            isLoadingRef.current = false;
        }
    }, [pageSize, lastProductId, hasMore, enabled]);

    // Update the loadMore ref whenever the function changes
    useEffect(() => {
        loadMoreFnRef.current = loadMore;
    }, [loadMore]);

    /**
     * Reset to initial state and load first batch.
     * Called when filters change or manual reset is needed.
     */
    const reset = useCallback(async () => {
        // Clear existing products first to prevent flickering
        setProducts([]);
        setIsLoading(true);
        setIsLoadingMore(false);
        setError(null);
        setHasMore(true);
        setLastProductId(undefined);
        isLoadingRef.current = false;

        try {
            const result = await fetchFnRef.current(filtersRef.current, pageSize, undefined);

            // Set products directly for initial load
            setProducts(result.products);
            setHasMore(result.hasMore);
            setLastProductId(result.lastProductId);
        } catch (err) {
            console.error('Error loading initial products:', err);
            setError(err instanceof Error ? err.message : 'Failed to load products');
        } finally {
            setIsLoading(false);
        }
    }, [pageSize]);

    // Reset when filters change (use JSON.stringify for deep comparison)
    const filtersString = JSON.stringify(filters);
    const prevFiltersRef = useRef(filtersString);

    useEffect(() => {
        if (prevFiltersRef.current !== filtersString) {
            prevFiltersRef.current = filtersString;

            // On initial mount with initial data, just use the data, don't fetch
            if (isInitialMount.current && initialData) {
                isInitialMount.current = false;
                return;
            }

            isInitialMount.current = false;
            reset();
        }
    }, [filtersString, reset, initialData]);

    // Setup intersection observer for automatic loading
    useEffect(() => {
        if (!enabled || !loadMoreRef.current) return;

        const currentRef = loadMoreRef.current;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && hasMore && !isLoadingRef.current) {
                    // Use requestAnimationFrame to prevent scroll jerk
                    requestAnimationFrame(() => {
                        if (loadMoreFnRef.current) {
                            loadMoreFnRef.current();
                        }
                    });
                }
            },
            {
                rootMargin,
                threshold
            }
        );

        observerRef.current.observe(currentRef);

        return () => {
            if (observerRef.current && currentRef) {
                observerRef.current.unobserve(currentRef);
            }
        };
    }, [hasMore, enabled, rootMargin, threshold]); // Removed loadMore dependency

    // Cleanup
    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []); return {
        products,
        isLoading,
        isLoadingMore,
        error,
        hasMore,
        loadMoreRef,
        loadMore,
        reset
    };
}