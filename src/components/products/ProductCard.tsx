'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Product } from '@/lib/models/Product';

type ProductCardProps = {
  product: Product;
  viewMode?: 'grid' | 'list';
  hidePricing?: boolean;
};

export default function ProductCard({ product, viewMode = 'grid', hidePricing = false }: ProductCardProps) {
  const isMobile = useIsMobile();
  const [brandLogoLoaded, setBrandLogoLoaded] = useState(true);


  if (viewMode === 'list') {
    return (
      <Link href={`/product/${product.id}`} className="block group w-full">
        <div className={`bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border border-base-200 hover:border-primary/30 rounded-xl overflow-hidden flex w-full ${isMobile ? 'h-32' : 'h-40'}`}>
          {/* Image - Square aspect ratio, responsive sizing */}
          <figure className={`${isMobile ? 'w-30 h-30' : 'w-40 h-40'} relative overflow-hidden flex-shrink-0`}>
            <Image
              src={product.image || product.images?.[0] || '/images/bicycle_no_bg.png'}
              alt={product.name}
              width={400}
              height={400}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
            {/* Discount Badge */}
            {product.discountPercentage && (
              <div className="absolute top-1 left-1 bg-red-500 text-white w-12 h-4 flex items-center justify-center rounded text-xs font-bold shadow-md z-10">
                {product.discountPercentage}% OFF
              </div>
            )}
          </figure>

          {/* Content - Remaining width, full height */}
          <div className={`flex-1 ${isMobile ? 'p-2' : 'p-3'} flex flex-col justify-between`}>
            {/* Top section */}
            <div className="space-y-2">
              {/* Brand and Rating */}
              <div className="flex items-center justify-between">
                {/* Brand */}
                {product.brand && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-base-200 rounded flex items-center justify-center flex-shrink-0">
                      {brandLogoLoaded ? (
                        <Image
                          src={product.brandLogo}
                          alt={product.brand}
                          width={16}
                          height={16}
                          className="object-contain rounded"
                          onError={() => setBrandLogoLoaded(false)}
                        />
                      ) : (
                        <span className="text-xs font-bold text-base-content/60">
                          {product.brand.charAt(0).toUpperCase()}
                        </span>
                      )}
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
                        className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-base-300'}`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-xs">{product.rating}</span>
                </div>
              </div>

              {/* Product Title */}
              <h2 className="text-base font-semibold hover:text-primary transition-colors duration-300 leading-tight line-clamp-1">
                {product.name}
              </h2>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-base-content/70 text-xs leading-relaxed line-clamp-1">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Bottom section - Pricing */}
            {!hidePricing && (
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-base-content font-currency">
                    ₹{product.discountedPrice.toLocaleString('en-IN')}
                  </span>
                  {product.discountPercentage && product.actualPrice && (
                    <span className="text-base-content/60 line-through text-xs font-currency">
                      ₹{product.actualPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <button className="btn btn-circle btn-xs bg-base-200 hover:bg-base-300 border-base-300 hover:border-base-400 shadow-sm transform hover:scale-105 transition-all duration-200">
                  <Plus className="w-3 h-3 text-base-content" />
                </button>
              </div>
            )}
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
            src={product.image || product.images?.[0] || '/images/bicycle_no_bg.png'}
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

        <div className="card-body p-1.5 sm:p-2 space-y-1">
          {/* Brand and Rating */}
          <div className="flex items-center justify-between">
            {/* Brand */}
            {product.brand && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-base-200 rounded flex items-center justify-center flex-shrink-0">
                  {brandLogoLoaded ? (
                    <Image
                      src={product.brandLogo}
                      alt={product.brand}
                      width={16}
                      height={16}
                      className="object-contain rounded"
                      onError={() => setBrandLogoLoaded(false)}
                    />
                  ) : (
                    <span className="text-xs font-bold text-base-content/60">
                      {product.brand.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-base-content/70 text-xs sm:text-sm font-medium truncate">
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
          <h2 className="text-sm sm:text-base leading-tight hover:text-primary transition-colors duration-300 font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
            {product.name}
          </h2>


          {/* Pricing */}
          {!hidePricing && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-base-content font-currency">
                ₹{product.discountedPrice.toLocaleString('en-IN')}
              </span>
              {product.discountPercentage && product.actualPrice && (
                <span className="text-base-content/50 line-through text-[10px] sm:text-xs font-currency">
                  ₹{product.actualPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
