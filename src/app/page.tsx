"use client";

import { useState, useMemo, useEffect } from 'react';
import { fetchProducts } from '@/lib/services/products';
import ProductFilters from '@/components/product-filters';
import ProductGrid from '@/components/product-grid';
import ProductSort from '@/components/product-sort';
import ViewToggle from '@/components/view-toggle';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Product } from '@/lib/models/Product';

export default function StorePage() {
  const [filters, setFilters] = useState({
    type: [] as string[],
    brand: [] as string[],
    price: [0, 120000] as [number, number],
  });
  const [sort, setSort] = useState('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    async function loadProducts() {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
    }
    loadProducts();
  }, []);

  // Memoize the filtered and sorted products to avoid unnecessary recalculations
  const filteredProducts = useMemo(() => {
    // First, filter products based on selected filters
    return products
      .filter(p => {
        // Check if product type matches any selected type, or if no type filter is applied
        const typeMatch = filters.type.length === 0 || filters.type.includes(p.type);
        // Check if product brand matches any selected brand, or if no brand filter is applied
        const brandMatch = filters.brand.length === 0 || filters.brand.includes(p.brand);
        // Check if product price is within the selected price range
        const priceMatch = p.price >= filters.price[0] && p.price <= filters.price[1];
        // Only include products that match all filter criteria
        return typeMatch && brandMatch && priceMatch;
      })
      // Then, sort the filtered products based on the selected sort option
      .sort((a, b) => {
        switch (sort) {
          case 'price-asc':
            // Sort by price, lowest to highest
            return a.price - b.price;
          case 'price-desc':
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
  // Recompute only when filters, sort, or products change
  }, [filters, sort, products]);

  return (
    <div>
      <h1 className="text-4xl font-bold font-headline text-center mb-2">Explore Our Collection</h1>
      <p className="text-lg text-muted-foreground text-center mb-8">Find the perfect ride and gear for your next adventure.</p>

      <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-4 gap-8'} items-start`}>
        <aside className={isMobile ? '' : 'lg:col-span-1'}>
          <ProductFilters filters={filters} setFilters={setFilters} />
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
