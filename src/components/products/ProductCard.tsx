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
      <Link href={`/product/${product.slug}`} className="block group w-full">
        <div className={`bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border border-base-200 hover:border-primary/30 rounded-xl overflow-hidden flex w-full ${isMobile ? 'h-24' : 'h-40'}`}>
          {/* Image - Square aspect ratio, responsive sizing */}
          <figure className={`${isMobile ? 'w-24 h-24' : 'w-40 h-40'} relative overflow-hidden flex-shrink-0`}>
            <Image
              src={product.image || product.images?.[0] || '/images/bicycle_no_bg.png'}
              alt={product.name}
              width={400}
              height={400}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
            {/* Discount Badge & Out of Stock stacked (image) - only on mobile */}
            {(product.roundedDiscountPercentage || (typeof product.inventory === 'number' && product.inventory < 1 && isMobile)) && (
              <div className="absolute top-1 left-1 flex flex-col gap-1 z-10">
                {product.roundedDiscountPercentage && (
                  <div className="bg-red-500 text-white w-12 h-4 flex items-center justify-center rounded text-xs font-bold shadow-md">
                    {product.roundedDiscountPercentage}% OFF
                  </div>
                )}
                {typeof product.inventory === 'number' && product.inventory < 1 && isMobile && (
                  <div className="bg-red-100 text-red-700 w-16 h-4 flex items-center justify-center rounded text-xs font-bold shadow-md">
                    Out of Stock
                  </div>
                )}
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
              <h2
                className={`font-semibold hover:text-primary transition-colors duration-300 leading-tight${isMobile ? ' text-sm line-clamp-2 py-0.5' : ' text-xl line-clamp-1 py-1'}`}
                style={isMobile ? { wordBreak: 'break-word', paddingTop: '2px', paddingBottom: '2px' } : {}}
              >
                {product.name}
              </h2>

              {/* Mobile: Show price instead of description */}
              {isMobile ? (
                <p className="text-base-content font-bold text-sm leading-relaxed line-clamp-1 font-currency">
                  ₹{product.discountedPrice.toLocaleString('en-IN')}
                  {product.roundedDiscountPercentage && product.actualPrice && (
                    <span className="text-base-content/60 line-through text-xs font-currency ml-2">
                      ₹{product.actualPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </p>
              ) : (
                product.shortDescription && (
                  <p className="text-base-content/70 text-s leading-relaxed line-clamp-1">
                    {product.shortDescription}
                  </p>
                )
              )}
              {/* Out of Stock Label */}
              {typeof product.inventory === 'number' && product.inventory < 1 && (
                <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded mt-1">Out of Stock</span>
              )}
            </div>

            {/* Bottom section - Pricing */}
            {!hidePricing && (
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-base-content font-currency">
                    ₹{product.discountedPrice.toLocaleString('en-IN')}
                  </span>
                  {product.roundedDiscountPercentage && product.actualPrice && (
                    <span className="text-base-content/60 line-through text-xs font-currency">
                      ₹{product.actualPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/product/${product.slug}`} className="block group">
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
          {/* Discount Badge & Out of Stock stacked (Grid View) */}
          {(product.roundedDiscountPercentage || (typeof product.inventory === 'number' && product.inventory < 1)) && (
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
              {product.roundedDiscountPercentage && (
                <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                  {product.roundedDiscountPercentage}% OFF
                </div>
              )}
              {typeof product.inventory === 'number' && product.inventory < 1 && (
                <div className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                  Out of Stock
                </div>
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </figure>

        <div className={`card-body p-1.5 sm:p-2 space-y-1 justify-between flex flex-col`}>
          {/* Brand and Rating */}
          <div className="flex items-center justify-between">
            {/* Brand */}
            {product.brand && (
              <div className="flex items-center gap-2 min-w-0">
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

            {/* Rating (mobile grid: single star + number) */}
            {isMobile ? (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold text-base-content whitespace-nowrap">{product.rating}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 flex-wrap min-w-0" style={{ flexShrink: 0 }}>
                <div className="flex items-center gap-0.5 flex-nowrap">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={`grid-star-${product.id}-${i}`}
                      className={`w-2.5 h-2.5 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-base-300'}`}
                      style={{ minWidth: '1rem' }}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-base-content whitespace-nowrap">
                  {product.rating}
                </span>
              </div>
            )}
          </div>

          {/* Product Title */}
          <h2
            className="text-sm sm:text-base leading-tight hover:text-primary transition-colors duration-300 font-semibold break-words line-clamp-2 min-h-[2.4rem] sm:min-h-[3.2rem]"
            style={{ wordBreak: 'break-word' }}
          >
            {product.name}
          </h2>


          {/* Pricing */}
          {!hidePricing && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-base-content font-currency">
                ₹{product.discountedPrice.toLocaleString('en-IN')}
              </span>
              {product.roundedDiscountPercentage && product.actualPrice && (
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
