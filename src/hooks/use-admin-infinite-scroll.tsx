'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/lib/models/Product';

/**
 * Admin infinite scroll response interface matching server implementation
 */
interface AdminInfiniteScrollResponse {
    products: Product[];
    hasMore: boolean;
    lastProductId?: string;
}

/**
 * Filter parameters for admin product queries (without sort options)
 */
interface AdminProductFilters {
    search?: string;
    category?: string;
    subCategory?: string;
    brand?: string;
}

/**
 * Admin-specific infinite scroll hook for protected product queries.
 * 
 * **Architecture:**
 * - Uses cursor-based pagination with product IDs
 * - Syncs filter state with URL parameters
 * - Handles authentication and admin-only endpoints
 * - Integrates with intersection observer for auto-loading
 * 
 * **Usage:**
 * ```tsx
 * const {
 *   products,
 *   isLoading,
 *   hasMore,
 *   loadMore,
 *   setFilters,
 *   refreshProducts
 * } = useAdminInfiniteScroll({
 *   pageSize: 24,
 *   initialFilters: { sortBy: 'createdAt' }
 * });
 * ```
 * 
 * @param options Configuration options for infinite scroll
 * @returns Infinite scroll state and control functions
 */
export function useAdminInfiniteScroll({
    pageSize = 24,
    initialFilters = {},
}: {
    pageSize?: number;
    initialFilters?: AdminProductFilters;
} = {}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State management
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [lastProductId, setLastProductId] = useState<string | undefined>();
    const [error, setError] = useState<string | null>(null);

    // Ref to track initialization and prevent double calls
    const isInitialized = useRef(false);
    const currentSearchParams = useRef<string>('');
    const isLoadingRef = useRef(false);

    // Track current filters from URL params (no sorting)
    const currentFilters: AdminProductFilters = {
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
        subCategory: searchParams.get('subCategory') || undefined,
        brand: searchParams.get('brand') || undefined,
    };

    /**
     * Fetch products from admin API with current filters and pagination
     */
    const fetchProducts = useCallback(async (
        filters: AdminProductFilters,
        startAfterId?: string,
        append = false
    ): Promise<AdminInfiniteScrollResponse> => {
        const params = new URLSearchParams();

        // Add filter parameters (no sorting)
        if (filters.search) params.set('search', filters.search);
        if (filters.category) params.set('category', filters.category);
        if (filters.subCategory) params.set('subCategory', filters.subCategory);
        if (filters.brand) params.set('brand', filters.brand);

        // Add pagination parameters
        params.set('pageSize', pageSize.toString());
        if (startAfterId) params.set('startAfterId', startAfterId);

        const response = await fetch(`/api/admin/products?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized - Admin access required');
            }
            throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        return response.json();
    }, [pageSize]);

    /**
     * Load initial products or refresh with new filters
     */
    const loadProducts = useCallback(async (filters: AdminProductFilters) => {
        // Prevent concurrent loading
        if (isLoadingRef.current) return;

        isLoadingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchProducts(filters);
            setProducts(data.products);
            setHasMore(data.hasMore);
            setLastProductId(data.lastProductId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load products');
            setProducts([]);
            setHasMore(false);
        } finally {
            setIsLoading(false);
            isLoadingRef.current = false;
        }
    }, [fetchProducts]);

    /**
     * Load more products (append to existing list)
     */
    const loadMore = useCallback(async () => {
        if (!hasMore || isLoadingMore || !lastProductId) return;

        setIsLoadingMore(true);
        setError(null);

        try {
            const data = await fetchProducts(currentFilters, lastProductId);
            setProducts(prev => [...prev, ...data.products]);
            setHasMore(data.hasMore);
            setLastProductId(data.lastProductId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load more products');
        } finally {
            setIsLoadingMore(false);
        }
    }, [hasMore, isLoadingMore, lastProductId, currentFilters, fetchProducts]);

    /**
     * Update filters and sync with URL
     */
    const setFilters = useCallback((newFilters: Partial<AdminProductFilters>) => {
        const params = new URLSearchParams(searchParams.toString());

        // Update URL parameters
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value.trim() !== '') {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        // Navigate to new URL
        router.push(`?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    /**
     * Clear all filters and reset to initial state
     */
    const clearFilters = useCallback(() => {
        router.push(window.location.pathname, { scroll: false });
    }, [router]);

    /**
     * Refresh products with current filters
     */
    const refreshProducts = useCallback(() => {
        loadProducts(currentFilters);
    }, [loadProducts, currentFilters]);

    // Load products when filters change - with initialization tracking to prevent double calls
    useEffect(() => {
        const currentParamsString = searchParams.toString();

        // Prevent double calls by checking if we've already initialized with these params
        // or if we're currently loading
        if ((isInitialized.current && currentSearchParams.current === currentParamsString) ||
            isLoadingRef.current) {
            return;
        }

        // Update tracking refs
        currentSearchParams.current = currentParamsString;
        isInitialized.current = true;

        // Load products using the existing loadProducts function
        loadProducts(currentFilters);
    }, [searchParams, loadProducts]); // Simplified dependencies

    return {
        // Data
        products,
        hasMore,
        currentFilters,

        // Loading states
        isLoading,
        isLoadingMore,
        error,

        // Actions
        loadMore,
        setFilters,
        clearFilters,
        refreshProducts,
    };
}