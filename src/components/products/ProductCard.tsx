'use client';

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
        <div className="card card-side bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border border-base-200 hover:border-primary/30 rounded-xl overflow-hidden">
          <figure className={`${isMobile ? 'w-full h-32' : 'w-48 h-full'} relative overflow-hidden`}>
            <Image
              src={product.images?.[0] || '/images/bicycle_no_bg.png'}
              alt={product.name}
              width={400}
              height={300}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
            {/* Discount Badge */}
            {product.discountPercentage && (
              <div className="absolute top-1 left-1  bg-red-500 text-white w-14 h-5 flex items-center justify-center rounded text-xs font-bold shadow-md z-10">
                {product.discountPercentage}% OFF
              </div>
            )}
          </figure>
          <div className="card-body p-4 space-y-2">
            {/* Brand and Rating */}
            <div className="flex items-center justify-between">
              {/* Brand */}
              {product.brand && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-base-200 rounded flex items-center justify-center flex-shrink-0">
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
                  <span className="text-base-content/70 text-sm font-medium truncate">
                    {product.brand}
                  </span>
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={`list-star-${product.id}-${i}`}
                      className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-base-300'}`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-sm">{product.rating}</span>
              </div>
            </div>

            {/* Product Title */}
            <h2 className="card-title text-lg hover:text-primary transition-colors duration-300 leading-tight line-clamp-2">
              {product.name}
            </h2>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-base-content/70 text-sm leading-relaxed line-clamp-2">
                {product.shortDescription}
              </p>
            )}

            {/* Pricing */}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-base-content font-currency">
                  ₹{product.discountedPrice.toLocaleString('en-IN')}
                </span>
                {product.discountPercentage && (
                  <span className="text-base-content/60 line-through text-sm font-currency">
                    ₹{product.price.toLocaleString('en-IN')}
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
      <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full border border-base-200 hover:border-primary/30 overflow-hidden rounded-xl">
        <figure className="aspect-square relative overflow-hidden">
          <Image
            src={product.images?.[0] || '/images/bicycle_no_bg.png'}
            alt={product.name}
            width={400}
            height={400}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          {/* Discount Badge */}
          {product.discountPercentage && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
              {product.discountPercentage}% OFF
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </figure>

        <div className="card-body p-2 space-y-1">
          {/* Brand and Rating */}
          <div className="flex items-center justify-between">
            {/* Brand */}
            {product.brand && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-base-200 rounded flex items-center justify-center flex-shrink-0">
                  <Image
                    src={product.brandLogo}
                    alt={product.brand}
                    width={16}
                    height={16}
                    className="object-contain rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-xs font-bold text-base-content/60">
                    {product.brand.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-base-content/70 text-sm font-medium truncate">
                  {product.brand}
                </span>
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={`grid-star-${product.id}-${i}`}
                    className={`w-2.5 h-2.5 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-base-300'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-base-content">
                {product.rating}
              </span>
            </div>
          </div>

          {/* Product Title */}
          <h2 className="card-title text-base leading-tight hover:text-primary transition-colors duration-300 line-clamp-2">
            {product.name}
          </h2>


          {/* Pricing */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-base-content font-currency">
              ₹{product.discountedPrice.toLocaleString('en-IN')}
            </span>
            {product.discountPercentage && (
              <span className="text-base-content/50 line-through text-xs font-currency">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
