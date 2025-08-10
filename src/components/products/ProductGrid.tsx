'use client';

import type { Product } from '@/lib/models/Product';
import ProductCard from './ProductCard';

type ProductGridProps = {
  products: Product[];
  viewMode: 'grid' | 'list';
};

export default function ProductGrid({ products, viewMode }: ProductGridProps) {

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
