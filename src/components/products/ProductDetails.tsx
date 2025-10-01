"use client";

import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/models/Product';

export default function ProductDetails({ product }: { product: Product }) {
  const { addItem } = useCart();

  // Prepare images array - no placeholder, use actual product images only
  const images = product.images && product.images.length > 0 ? product.images : [];
  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  // Initialize thumbnail loading state for all images as true
  const [thumbnailLoading, setThumbnailLoading] = useState<{ [key: number]: boolean }>(() => {
    const initialState: { [key: number]: boolean } = {};
    images.forEach((_, index) => {
      initialState[index] = true;
    });
    return initialState;
  });

  // Calculate savings if there's a discount - Updated for new price structure
  const savings = product.discountPercentage && product.actualPrice
    ? product.actualPrice - (product.price || product.actualPrice * (1 - product.discountPercentage / 100))
    : 0;

  return (
    <>
      {/* Breadcrumb - Enhanced style like subcategories */}
      <div className="max-w-[1400px] mx-auto px-8 pt-0 pb-3">
        <div className="flex flex-col gap-1">
          <span className="text-xl font-extrabold text-gray-700 uppercase tracking-wider pb-2">
            Product Details
          </span>
          <div className="flex items-center gap-2 text-sm">
            <a
              href="/"
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium hover:bg-gray-200 hover:text-primary transition-colors cursor-pointer"
            >
              Home
            </a>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <a
              href="/products"
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium hover:bg-gray-200 hover:text-primary transition-colors cursor-pointer"
            >
              Products
            </a>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <a
              href={`/products/${encodeURIComponent(product.category)}`}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium hover:bg-gray-200 hover:text-primary transition-colors cursor-pointer"
            >
              {product.category}
            </a>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="bg-primary/20 text-primary px-2 py-1 rounded-md font-medium">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 pb-16">
        <div className={`grid gap-16 mb-16 ${hasImages ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 place-items-center'}`}>
          {/* Image Section - Only show if there are images */}
          {hasImages && (
            <div className="lg:sticky lg:top-8 lg:h-fit pt-2">
              <div className="flex gap-4">
                {/* Thumbnail List - Left side on desktop */}
                {hasMultipleImages && (
                  <div className="hidden lg:flex flex-col gap-3 w-20">
                    {images.slice(0, 4).map((image, index) => (
                      <div
                        key={index}
                        className={`relative aspect-square overflow-hidden rounded-lg cursor-pointer border-2 transition-all ${selectedImageIndex === index
                          ? 'border-blue-500'
                          : 'border-transparent hover:border-gray-300'
                          }`}
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setImageLoading(true);
                        }}
                      >
                        {thumbnailLoading[index] && (
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
                          </div>
                        )}
                        <Image
                          src={image}
                          alt={`${product.name} view ${index + 1}`}
                          width={80}
                          height={80}
                          className={`w-full h-full object-cover transition-opacity duration-300 ${thumbnailLoading[index] ? 'opacity-0' : 'opacity-100'}`}
                          onLoad={() => setThumbnailLoading(prev => ({ ...prev, [index]: false }))}
                          onLoadingComplete={() => setThumbnailLoading(prev => ({ ...prev, [index]: false }))}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Main Image Container */}
                <div className="flex-1">
                  {/* Main Image */}
                  <div className="relative mb-4">
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
                      {imageLoading && (
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
                        </div>
                      )}
                      <Image
                        src={images[selectedImageIndex]}
                        alt={product.name}
                        fill
                        className={`object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                        onLoad={() => setImageLoading(false)}
                        onLoadingComplete={() => setImageLoading(false)}
                      />
                    </div>
                  </div>

                  {/* Thumbnail Grid - Bottom on mobile */}
                  {hasMultipleImages && (
                    <div className="grid grid-cols-4 gap-3 lg:hidden">
                      {images.slice(0, 4).map((image, index) => (
                        <div
                          key={index}
                          className={`relative aspect-square overflow-hidden rounded-lg cursor-pointer border-2 transition-all ${selectedImageIndex === index
                            ? 'border-blue-500'
                            : 'border-transparent hover:border-gray-300'
                            }`}
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setImageLoading(true);
                          }}
                        >
                          {thumbnailLoading[index] && (
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
                            </div>
                          )}
                          <Image
                            src={image}
                            alt={`${product.name} view ${index + 1}`}
                            width={200}
                            height={200}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${thumbnailLoading[index] ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={() => setThumbnailLoading(prev => ({ ...prev, [index]: false }))}
                            onLoadingComplete={() => setThumbnailLoading(prev => ({ ...prev, [index]: false }))}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className={`${!hasImages ? 'max-w-2xl' : ''}`}>
            {/* Product Title and Brand */}
            <div className="mb-4">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              {/* Brand Name */}
              {product.brand && (
                <a
                  href={`/products?brand=${encodeURIComponent(product.brand)}`}
                  className="text-lg text-gray-600 hover:text-primary transition-colors underline cursor-pointer pl-2"
                >
                  by {product.brand}
                </a>
              )}
            </div>

            {/* Rating and Tags */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-yellow-400 text-lg">
                  {'★'.repeat(Math.floor(product.rating))}
                  {product.rating % 1 !== 0 && '☆'}
                </div>
                <span className="text-gray-900 font-semibold">
                  {product.rating}
                </span>
              </div>

              {/* Tags */}
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded">
                  {product.category}
                </span>
                <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded">
                  {product.subCategory}
                </span>
              </div>
            </div>

            {/* Info Banner */}
            {product.shortDescription && (
              <div className="bg-cyan-50 border-l-4 border-cyan-400 p-4 mb-8 rounded-md">
                <div className="text-cyan-800 text-base">
                  {product.shortDescription}
                </div>
              </div>
            )}

            {/* Price Section */}
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              {/* Discount Badge */}
              {product.discountPercentage && (
                <div className="inline-block bg-red-500 text-white px-2 py-1 rounded font-semibold text-xs mb-3">
                  {product.discountPercentage}% OFF
                </div>
              )}

              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-gray-900 font-currency">
                  ₹{product.discountedPrice.toLocaleString('en-IN')}
                </span>
                {product.discountPercentage && product.actualPrice && (
                  <span className="text-lg text-gray-500 line-through font-currency">
                    ₹{product.actualPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <div className="text-green-600 font-medium mb-4 font-currency text-sm">
                  You save ₹{savings.toLocaleString('en-IN')}
                </div>
              )}
              <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg text-base font-semibold transition-colors"
                onClick={() => addItem(product)}
              >
                Add to Cart
              </button>
            </div>

            {/* Product Details */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">
                Product Details
              </h2>
              <p className="text-gray-700 leading-relaxed font-semibold pb-4">
                {product.details || product.shortDescription || 'High-quality product designed for optimal performance.'}
              </p>
            </div>

            {/* Features Section */}
            <div className="bg-green-50 rounded-xl p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-lg text-2xl">📦</div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">Quality Assured</h4>
                    <p className="text-gray-700 text-sm">All products are tested for quality and durability</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-lg text-2xl">🚚</div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">Free Shipping</h4>
                    <p className="text-gray-700 text-sm">On orders above ₹999. Delivery in 3-5 business days.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-lg text-2xl">🏅</div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">Warranty</h4>
                    <p className="text-gray-700 text-sm">Manufacturer warranty included with purchase</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}