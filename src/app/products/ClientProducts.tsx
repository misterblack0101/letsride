"use client";

import { useState, useMemo } from 'react';
import ProductFilters from '@/components/products/ProductFilters';
import ProductGrid from '@/components/products/ProductGrid';
import ProductSort from '@/components/products/ProductSort';
import ViewToggle from '@/components/view-toggle';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Product } from '@/lib/models/Product';

interface ProductsClientProps {
    initialProducts: Product[];
}

export default function ClientProducts({ initialProducts }: ProductsClientProps) {
    const [filters, setFilters] = useState({
        type: [] as string[],
        brand: [] as string[],
        price: [0, 120000] as [number, number],
    });
    const [sort, setSort] = useState('popularity');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const isMobile = useIsMobile();

    // Get available brands and types from initial products
    const availableBrands = useMemo(() => {
        return [...new Set(initialProducts.map(p => p.brand))];
    }, [initialProducts]);

    const availableTypes = useMemo(() => {
        return [...new Set(initialProducts.map(p => p.type))];
    }, [initialProducts]);

    const filteredProducts = useMemo(() => {
        return initialProducts
            .filter(p => {
                // Filter by type
                const typeMatch = filters.type.length === 0 || filters.type.includes(p.type);
                // Filter by brand
                const brandMatch = filters.brand.length === 0 || filters.brand.includes(p.brand);
                // Filter by price range
                const priceMatch = p.price >= filters.price[0] && p.price <= filters.price[1];

                return typeMatch && brandMatch && priceMatch;
            })
            .sort((a, b) => {
                switch (sort) {
                    case 'name':
                        // Sort by name, A to Z
                        return a.name.localeCompare(b.name);
                    case 'price_low':
                        // Sort by price, lowest to highest
                        return a.price - b.price;
                    case 'price_high':
                        // Sort by price, highest to lowest
                        return b.price - a.price;
                    case 'rating':
                        // Sort by rating, highest to lowest
                        return b.rating - a.rating;
                    case 'popularity':
                    default:
                        // Sort by popularity, highest to lowest (default)
                        return b.popularity - a.popularity;
                }
            });
    }, [filters, sort, initialProducts]);

    return (
        <div>
            <h1 className="text-4xl font-bold font-headline text-center mb-2">Explore Our Collection</h1>
            <p className="text-lg text-muted-foreground text-center mb-8">Find the perfect ride and gear for your next adventure.</p>

            <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-4 gap-8'} items-start`}>
                <aside className={isMobile ? '' : 'lg:col-span-1'}>
                    <ProductFilters
                        filters={filters}
                        setFilters={setFilters}
                        availableBrands={availableBrands}
                        availableTypes={availableTypes}
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
        </div>
    );
}
