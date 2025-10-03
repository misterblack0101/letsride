'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/models/Product';
import ProductCard from '@/components/products/ProductCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, Search, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

// Interface for lightweight search results from API
interface LightweightSearchResult {
    id: string;
    name: string;
    brand: string;
    price: number;
    discountedPrice?: number;
    rating: number;
    imageUrl: string;
    category: string;
    subCategory: string;
}

// Convert lightweight results to Product format for ProductCard (same as search page)
function convertToProducts(lightweightResults: LightweightSearchResult[]): Product[] {
    return lightweightResults.map(result => ({
        id: result.id,
        name: result.name,
        brand: result.brand,
        category: result.category,
        subCategory: result.subCategory,
        price: result.price,
        discountedPrice: result.discountedPrice || result.price,
        actualPrice: result.price,
        rating: result.rating,
        images: result.imageUrl ? [result.imageUrl] : ['/images/placeholder.jpg'],
        brandLogo: '/images/placeholder.jpg', // Use placeholder instead of empty string
        inventory: 1, // Assume in stock for search results
        isRecommended: false,
        shortDescription: '',
        details: '',
        tags: []
    }));
}

/**
 * Product Management Interface for Admin Panel with Algolia Search.
 * 
 * **Architecture:**
 * - Uses the same double-loading prevention pattern as ProductGrid component
 * - Uses ProductCard components with search page styling (grid view, no pricing)
 * - Converts lightweight search results to full Product format (same as search page)
 * - Initial load displays all products via /api/admin/products for admin overview
 * - Manual cursor-based pagination with "Load More" button (no auto-triggers)
 * - Algolia-powered search interface via secure server-side API routes
 * - Single search bar for finding products by name, brand, category, etc.
 * - Click-to-edit navigation to /admin/edit/[id] route
 * - Grid layout exactly matching search results page
 * - SSR search pattern preventing client-side API key exposure
 * 
 * **Features:**
 * - Loads initial products on mount with proper initialization tracking (same as ProductGrid)
 * - Professional search with typo tolerance and instant results via /api/search
 * - Manual "Load More" button with proper guards to prevent API spam
 * - Search pagination support with 24 results per page
 * - ProductCard components with hidePricing={true} for consistent admin UI
 * - Image conversion: imageUrl → images array for ProductCard compatibility
 * - Full-width search bar with clear and search icons
 * - "Clear Results" button appears when search results are displayed
 * - Clear search returns to paginated product grid view
 * - Click cards to edit individual products
 * - Create new products via dedicated form
 * - Secure API key handling through server-side routes
 * 
 * **UI Components:**
 * - ProductCard with viewMode="grid" and hidePricing={true} (same as search page)
 * - Grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
 * - Click wrapper for navigation to edit routes
 * - Consistent styling with main search functionality
 * - Proper image handling via convertToProducts function
 * 
 * **Data Processing:**
 * - LightweightSearchResult → Product conversion (same as search page)
 * - imageUrl string → images array conversion for ProductCard
 * - Default values for missing Product fields (inventory, isRecommended, etc.)
 * - Proper fallback to placeholder images
 * 
 * **Pagination:**
 * - Uses cursor-based pagination (startAfterId) for optimal performance in browse mode
 * - Uses offset-based pagination for Algolia search results
 * - Manual triggers only - no automatic loading or infinite loops
 * - Loads 24 products per page to balance UX and performance
 * - "Load More" button appears for both search and browse modes when more items available
 * - Proper useCallback guards prevent API spam and infinite re-renders
 * - Double-loading prevention with useRef initialization flag (same pattern as ProductGrid)
 */

export default function ProductManagement() {
    const router = useRouter();
    const { getIdToken } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [lastProductId, setLastProductId] = useState<string | undefined>();
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchOffset, setSearchOffset] = useState(0); // For Algolia pagination

    // Track if component has been initialized to prevent infinite loops (same as ProductGrid)
    const isInitialized = useRef(false);

    /**
     * Load initial products for admin overview (similar to resetAndLoad in ProductGrid)
     */
    const loadInitialProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setProducts([]);
        setLastProductId(undefined);
        setHasMore(false);
        setSearchOffset(0);

        try {
            const token = await getIdToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch('/api/admin/products?pageSize=24', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to load products: ${response.status}`);
            }
            const data = await response.json();

            setProducts(data.products || []);
            setHasMore(data.hasMore || false);
            setLastProductId(data.lastProductId);
            setIsSearchMode(false);
        } catch (err) {
            console.error('Load products error:', err);
            setError('Failed to load products. Please try again.');
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [getIdToken]); // Include getIdToken in dependencies

    /**
     * Load more products for pagination (manual trigger only)
     */
    const loadMoreProducts = useCallback(async () => {
        if (isLoadingMore || !hasMore || isSearchMode) return;

        setIsLoadingMore(true);
        setError(null);

        try {
            const token = await getIdToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            let url = '/api/admin/products?pageSize=24';
            if (lastProductId) {
                url += `&startAfterId=${lastProductId}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to load more products: ${response.status}`);
            }
            const data = await response.json();

            setProducts(prev => [...prev, ...(data.products || [])]);
            setHasMore(data.hasMore || false);
            setLastProductId(data.lastProductId);
        } catch (err) {
            console.error('Load more error:', err);
            setError('Failed to load more products. Please try again.');
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasMore, isSearchMode, lastProductId, getIdToken]);    /**
     * Handle search execution using server-side API with pagination support
     */
    const executeSearch = useCallback(async (isLoadMore = false) => {
        if (!searchTerm.trim()) {
            // If no search term, reset to initial products
            // Don't reset isInitialized - just clear and reload
            setProducts([]);
            loadInitialProducts();
            return;
        }

        if (isLoadMore) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
            setProducts([]);
            setSearchOffset(0);
        }
        setError(null);

        try {
            const offset = isLoadMore ? searchOffset : 0;
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm.trim())}&limit=24&offset=${offset}`);
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            const data = await response.json();

            // Convert lightweight search results to Product format
            const convertedProducts = convertToProducts(data.products || []);

            if (isLoadMore) {
                setProducts(prev => [...prev, ...convertedProducts]);
            } else {
                setProducts(convertedProducts);
            }

            setIsSearchMode(true);
            setSearchOffset(offset + 24);
            // Check if we have more results (assuming we got less than 24 means no more)
            setHasMore((data.products || []).length === 24);
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to search products. Please try again.');
            if (!isLoadMore) {
                setProducts([]);
            }
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [searchTerm, searchOffset, loadInitialProducts]);

    /**
     * Load more search results for pagination
     */
    const loadMoreSearch = useCallback(async () => {
        if (isLoadingMore || !hasMore || !isSearchMode || !searchTerm.trim()) return;
        executeSearch(true);
    }, [isLoadingMore, hasMore, isSearchMode, searchTerm, executeSearch]);

    // Load initial products on component mount (same pattern as ProductGrid)
    useEffect(() => {
        // First time initialization (same logic as ProductGrid)
        if (isInitialized.current) {
            // Already initialized, don't reload
            return;
        } else {
            // First time - load initial products
            isInitialized.current = true;
            loadInitialProducts();
        }
    }, [loadInitialProducts]); // Include loadInitialProducts dependency like ProductGrid

    /**
     * Handle Enter key press for search
     */
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeSearch(false);
        }
    };

    /**
     * Clear search and reload all products
     */
    const clearSearch = () => {
        setSearchTerm('');
        setError(null);
        setProducts([]);
        loadInitialProducts();
    };

    /**
     * Handle search button click
     */
    const handleSearchClick = () => {
        executeSearch(false);
    };

    /**
     * Handle card click to navigate to edit page
     */
    const handleCardClick = (product: Product) => {
        router.push(`/admin/edit/${product.id}`);
    };

    /**
     * Handle product creation success
     */
    const handleProductSave = useCallback(() => {
        // Optionally re-run search to show updated results
        if (searchTerm.trim()) {
            executeSearch();
        }
    }, [searchTerm, executeSearch]);

    // Show form if creating
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Package className="w-8 h-8 text-blue-500" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                                <p className="text-sm text-gray-600">
                                    Search and manage your products
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                onClick={() => router.push('/admin/new')}
                                className="bg-blue-500 hover:bg-blue-600 flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Product</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6">
                {/* Search Section */}
                <Card className="mb-6 p-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Search Products</h3>

                        {/* Full-width search input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Search by product name, brand, category, or description..."
                                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        {/* Search actions */}
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleSearchClick}
                                disabled={!searchTerm.trim() || isLoading}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Searching...' : 'Search'}
                            </Button>
                            {isSearchMode && (
                                <Button
                                    onClick={clearSearch}
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Clear Results
                                </Button>
                            )}
                            {products.length > 0 && (
                                <span className="text-sm text-gray-600">
                                    {isSearchMode
                                        ? `Found ${products.length} products`
                                        : `Showing ${products.length} products${hasMore ? ' (more available)' : ''}`
                                    }
                                </span>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Error Display */}
                {error && (
                    <Card className="mb-6 p-4 border-red-200 bg-red-50">
                        <div className="text-red-700">
                            <strong>Error:</strong> {error}
                        </div>
                    </Card>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="ml-2 text-gray-600">Searching products...</span>
                    </div>
                )}

                {/* Results or Empty State */}
                {!isLoading && (
                    <>
                        {products.length === 0 && searchTerm ? (
                            <Card className="p-12 text-center">
                                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-600 mb-4">
                                    Try adjusting your search terms or keywords.
                                </p>
                            </Card>
                        ) : products.length === 0 && !searchTerm ? (
                            <Card className="p-12 text-center">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching for products</h3>
                                <p className="text-gray-600 mb-4">
                                    Use the search bar above to find products by name, brand, category, or description.
                                </p>
                                <Button onClick={() => router.push('/admin/new')} className="bg-blue-500 hover:bg-blue-600">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Product
                                </Button>
                            </Card>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            onClick={() => handleCardClick(product)}
                                            className="cursor-pointer"
                                        >
                                            <ProductCard
                                                product={product}
                                                viewMode="grid"
                                                hidePricing={true}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Load More Button */}
                                {hasMore && (
                                    <div className="mt-8 flex justify-center">
                                        <Button
                                            onClick={isSearchMode ? loadMoreSearch : loadMoreProducts}
                                            disabled={isLoadingMore}
                                            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50"
                                        >
                                            {isLoadingMore ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Loading more...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Package className="w-4 h-4" />
                                                    <span>Load More {isSearchMode ? 'Results' : 'Products'}</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}