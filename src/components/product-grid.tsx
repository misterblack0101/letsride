import type { Product } from '@/lib/types';
import ProductCard from './product-card';
import { useIsMobile } from '@/hooks/use-mobile';

type ProductGridProps = {
  products: Product[];
  viewMode: 'grid' | 'list';
};

export default function ProductGrid({ products, viewMode }: ProductGridProps) {
  const isMobile = useIsMobile();
  
  if (products.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <h2 className="text-2xl font-semibold font-headline">No Products Found</h2>
        <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
      </div>
    );
  }

  const gridClasses = viewMode === 'grid' 
    ? "grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-6"
    : "flex flex-col gap-4";

  return (
    <div className={gridClasses}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} viewMode={viewMode} />
      ))}
    </div>
  );
}
