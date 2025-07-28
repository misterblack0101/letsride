import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Product } from '@/lib/models/Product';

type ProductCardProps = {
  product: Product;
  viewMode?: 'grid' | 'list';
};

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const isMobile = useIsMobile();

  if (viewMode === 'list') {
    return (
      <Link href={`/product/${product.id}`} className="block">
        <div className="card card-side bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <figure className={`${isMobile ? 'w-full h-48' : 'w-48 h-full'}`}>
            <Image
              src={product.image}
              alt={product.name}
              width={400}
              height={300}
              className="object-cover w-full h-full"
              data-ai-hint={product.dataAiHint}
            />
          </figure>
          <div className="card-body">
            <div className="flex justify-between items-start">
              <div className="badge badge-secondary badge-outline">{product.type}</div>
              <div className="text-2xl font-bold text-primary">
                ₹{product.price.toLocaleString('en-IN')}
              </div>
            </div>
            <h2 className="card-title text-lg hover:text-primary transition-colors">
              {product.name}
            </h2>
            <div className="flex items-center gap-2 text-base-content/70">
              <div className="rating rating-sm">
                <Star className="w-4 h-4 text-warning fill-warning" />
              </div>
              <span>{product.rating}</span>
              <div className="divider divider-horizontal"></div>
              <span>{product.brand}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full">
        <figure className="aspect-video">
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={400}
            className="object-cover w-full h-full"
            data-ai-hint={product.dataAiHint}
          />
        </figure>
        <div className="card-body">
          <div className="badge badge-secondary badge-outline mb-2">{product.type}</div>
          <h2 className="card-title text-lg hover:text-primary transition-colors">
            {product.name}
          </h2>
          <div className="flex items-center gap-2 text-base-content/70 mb-4">
            <div className="rating rating-sm">
              <Star className="w-4 h-4 text-warning fill-warning" />
            </div>
            <span>{product.rating}</span>
            <div className="divider divider-horizontal"></div>
            <span>{product.brand}</span>
          </div>
          <div className="card-actions justify-end">
            <div className="text-2xl font-bold text-primary">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
