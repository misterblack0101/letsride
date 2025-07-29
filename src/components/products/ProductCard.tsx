import Link from 'next/link';
import Image from 'next/image';
import { Star, Plus } from 'lucide-react';
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
      <Link href={`/product/${product.id}`} className="block group">
        <div className="card card-side bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] border border-base-200 hover:border-primary/20">
          <figure className={`${isMobile ? 'w-full h-48' : 'w-64 h-full'} relative overflow-hidden`}>
            <Image
              src={product.images?.[0] || '/images/bicycle_no_bg.png'}
              alt={product.name}
              width={400}
              height={300}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            />
          </figure>
          <div className="card-body p-6">
            <div className="flex items-start gap-3 mb-3">
              {product.brand && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-base-200 rounded flex items-center justify-center">
                    <Image
                      src={product.brandLogo}
                      alt={product.brand}
                      width={24}
                      height={24}
                      className="object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="text-xs font-bold text-base-content/60">
                      {product.brand.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-bold text-base">{product.brand}</span>
                </div>
              )}
            </div>
            <h2 className="card-title text-xl hover:text-primary transition-colors duration-300 leading-tight mb-2">
              {product.name}
            </h2>
            {product.shortDescription && (
              <p className="text-base-content/70 text-sm leading-relaxed mb-4 line-clamp-2">
                {product.shortDescription}
              </p>
            )}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={`list-star-${product.id}-${i}`}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-warning fill-warning' : 'text-base-300'}`}
                  />
                ))}
              </div>
              <span className="font-semibold text-sm">{product.rating}</span>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                {product.discountPercentage && (
                  <span className="text-base-content/60 line-through text-sm font-currency">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xl font-bold text-primary font-currency">
                  ₹{product.discountedPrice.toLocaleString('en-IN')}
                </span>
                {product.discountPercentage && (
                  <span className="text-green-600 text-sm font-semibold">
                    -{product.discountPercentage}%
                  </span>
                )}
              </div>
              <button className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300 border-base-300 hover:border-base-400 shadow-sm transform hover:scale-105 transition-all duration-200">
                <Plus className="w-4 h-4 text-base-content" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/product/${product.id}`} className="block group">
      <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 h-full border border-base-200 hover:border-primary/20 overflow-hidden">
        <figure className="aspect-video relative overflow-hidden">
          <Image
            src={product.images?.[0] || '/images/bicycle_no_bg.png'}
            alt={product.name}
            width={600}
            height={400}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </figure>
        <div className="card-body p-6">
          <div className="flex items-start gap-3 mb-3">
            {product.brand && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-base-200 rounded flex items-center justify-center">
                  <Image
                    src={product.brandLogo}
                    alt={product.brand}
                    width={20}
                    height={20}
                    className="object-contain rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-xs font-bold text-base-content/60">
                    {product.brand.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-bold text-sm">{product.brand}</span>
              </div>
            )}
          </div>
          <h2 className="card-title text-lg hover:text-primary transition-colors duration-300 leading-tight mb-2">
            {product.name}
          </h2>
          {product.shortDescription && (
            <p className="text-base-content/70 text-sm leading-relaxed mb-4 line-clamp-2">
              {product.shortDescription}
            </p>
          )}
          <div className="flex items-center gap-2 text-base-content/70 mb-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={`grid-star-${product.id}-${i}`}
                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-warning fill-warning' : 'text-base-300'}`}
                />
              ))}
            </div>
            <span className="font-semibold text-sm">{product.rating}</span>
          </div>
          <div className="card-actions justify-between items-center mt-auto">
            <div className="flex items-center gap-2">
              {product.discountPercentage && (
                <span className="text-base-content/60 line-through text-sm font-currency">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xl font-bold text-primary font-currency">
                ₹{product.discountedPrice.toLocaleString('en-IN')}
              </span>
              {product.discountPercentage && (
                <span className="text-green-600 text-sm font-semibold">
                  -{product.discountPercentage}%
                </span>
              )}
            </div>
            <button className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300 border-base-300 hover:border-base-400 shadow-sm transform hover:scale-105 transition-all duration-200">
              <Plus className="w-4 h-4 text-base-content" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
