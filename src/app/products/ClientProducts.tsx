"use client";

import { useState, useMemo, useEffect } from 'react';
import ProductFilters from '@/components/products/ProductFilters';
import ProductGrid from '@/components/products/ProductGrid';
import ProductSort from '@/components/products/ProductSort';
import ViewToggle from '@/components/view-toggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoadingState, ProductGridSkeleton } from '@/components/ui/loading';
import type { Product } from '@/lib/models/Product';

interface ProductsClientProps {
    initialProducts?: Product[];
}

export default function ClientProducts({ initialProducts }: ProductsClientProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts || []);
    const [loading, setLoading] = useState(!initialProducts);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        brand: [] as string[],
        price: [0, 120000] as [number, number],
    });
    const [sort, setSort] = useState('rating');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const isMobile = useIsMobile();

    // const fetchProducts = async () => {
    //     try {
    //         setLoading(true);
    //         setError(null);
    //         const response = await fetch('/api/products');
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch products');
    //         }
    //         const data = await response.json();
    //         setProducts(data);
    //     } catch (err) {
    //         setError(err instanceof Error ? err.message : 'An error occurred');
    //         console.error('Error fetching products:', err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // Get available brands and categories from products
    const availableBrands = useMemo(() => {
        return [...new Set(products.map(p => p.brand).filter((brand): brand is string => !!brand))];
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products
            .filter(p => {
                // Filter by brand
                const brandMatch = filters.brand.length === 0 || (p.brand && filters.brand.includes(p.brand));
                // Filter by price range
                const priceMatch = p.price >= filters.price[0] && p.price <= filters.price[1];

                return brandMatch && priceMatch;
            })
            .sort((a, b) => {
                switch (sort) {
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
    }, [filters, sort, products]);

    return (
        <div>
            {/* <h1 className="text-4xl font-bold font-headline text-center mb-2">Explore Our Collection</h1>
            <p className="text-lg text-muted-foreground text-center mb-8">Find the perfect ride and gear for your next adventure.</p>

            {error && (
                <div className="text-center py-8">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={fetchProducts}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            )} */}

            {loading ? (
                <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-4 gap-8'} items-start`}>
                    <aside className={isMobile ? '' : 'lg:col-span-1'}>
                        <div className="bg-white rounded-lg p-4 shadow-sm border">
                            <div className="animate-pulse space-y-4">
                                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </aside>
                    <main className={isMobile ? '' : 'lg:col-span-3'}>
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                                <div className="flex gap-4">
                                    <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
                                    <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                        <ProductGridSkeleton />
                    </main>
                </div>
            ) : (
                <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-4 gap-8'} items-start`}>
                    <aside className={isMobile ? '' : 'lg:col-span-1'}>
                        <ProductFilters
                            filters={filters}
                            setFilters={setFilters}
                            availableBrands={availableBrands}
                        />
                    </aside>
                    <main className={isMobile ? '' : 'lg:col-span-3'}>
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h2 className="text-2xl font-semibold font-headline">Products</h2>
                                <div className={`flex gap-4 ${isMobile ? 'flex-col w-full' : 'items-center w-auto'}`}>
                                    <div className={isMobile ? 'w-full' : ''}>
                                        <ProductSort sort={sort} setSort={setSort} />
                                    </div>
                                    <div className={isMobile ? 'w-full' : ''}>
                                        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ProductGrid products={filteredProducts} viewMode={viewMode} />
                    </main>
                </div>
            )}
        </div>
    );
}
