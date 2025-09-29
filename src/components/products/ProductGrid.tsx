'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import type { Product } from '@/lib/models/Product';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '@/components/ui/loading';

type ProductGridProps = {
  products: Product[];
  viewMode: 'grid' | 'list';
};

/**
 * ProductGrid component that shows products in grid or list view
 * with loading state during pagination
 */
export default function ProductGrid({ products, viewMode }: ProductGridProps) {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Store a unique product ID string for comparison
  const productIdsString = products.map(p => p.id).join('|');

  // Setup pagination event handling
  useEffect(() => {
    // Function to handle pagination events
    const handlePageChange = () => {
      setIsLoading(true);

      // Note: scroll is now handled directly in ServerPagination for immediacy

      // Set safety timer to prevent stuck loading state
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = setTimeout(() => setIsLoading(false), 3000);
    };

    // Listen for pagination events
    window.addEventListener('paginationStart', handlePageChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('paginationStart', handlePageChange);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, []);

  // Reset loading state when products change
  useEffect(() => {
    setIsLoading(false);
  }, [productIdsString]);

  // Show skeleton during navigation
  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (products.length === 0) {
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
    <div className={gridClasses}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} viewMode={viewMode} />
      ))}
    </div>
  );
}
