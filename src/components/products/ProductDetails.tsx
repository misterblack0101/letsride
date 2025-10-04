import Image from 'next/image';
import { useState } from 'react';
import type { Product } from '@/lib/models/Product';
import ProductShareButton from './ProductShareButton';

interface ProductDetailsProps {
  product: Product;
  addItem?: (product: Product) => void;
}

export default function ProductDetails({ product, addItem }: ProductDetailsProps) {
  const [added, setAdded] = useState(false);
  const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null;

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
  const savings = product.roundedDiscountPercentage && product.actualPrice
    ? product.actualPrice - (product.price || product.actualPrice * (1 - product.roundedDiscountPercentage / 100))
    : 0;

  return (
    <>
      {/* Breadcrumbs: desktop unchanged, mobile font size consistent */}
      <div className="max-w-[1400px] mx-auto px-4 pt-2 pb-3">
        {/* Desktop: original breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-2 text-sm">
          <a href="/" className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium hover:bg-gray-200 hover:text-primary transition-colors">Home</a>
          <span className="text-gray-400">›</span>
          <a href="/products" className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium hover:bg-gray-200 hover:text-primary transition-colors">Products</a>
          <span className="text-gray-400">›</span>
          <a href={`/products/${encodeURIComponent(product.category)}`} className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium hover:bg-gray-200 hover:text-primary transition-colors">{product.category}</a>
          <span className="text-gray-400">›</span>
          <span className="bg-primary/10 text-primary px-2 py-1 rounded font-medium">{product.name}</span>
        </nav>
        {/* Mobile: breadcrumbs smaller font size, blue wraps only if needed */}
        <div className="sm:hidden">
          <nav className="flex items-center gap-2 text-sm font-medium flex-wrap">
            <a href="/" className="bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 hover:text-primary transition-colors">Home</a>
            <span className="text-gray-400">›</span>
            <a href="/products" className="bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 hover:text-primary transition-colors">Products</a>
            <span className="text-gray-400">›</span>
            <a href={`/products/${encodeURIComponent(product.category)}`} className="bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 hover:text-primary transition-colors">{product.category}</a>
            <span className="text-gray-400">›</span>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded font-medium break-words max-w-[60vw]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 pb-16">
        <div className={`grid gap-8 mb-10 sm:gap-16 sm:mb-16 ${hasImages ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 place-items-center'}`}>
          {/* Image Section - Responsive for mobile, thumbnails left on desktop */}
          {hasImages && (
            <div className="pt-2 pb-2 sm:pb-0">
              <div className="flex flex-col items-center gap-2 lg:flex-row lg:items-start lg:gap-8">
                {/* Thumbnails - left on desktop/web only */}
                {hasMultipleImages && (
                  <div className="hidden lg:flex flex-col gap-3 mr-4">
                    {images.slice(0, 6).map((image, index) => (
                      <div
                        key={index}
                        className={`relative aspect-square w-14 h-14 lg:w-20 lg:h-20 overflow-hidden rounded-lg cursor-pointer border-2 transition-all ${selectedImageIndex === index
                          ? 'border-blue-500'
                          : 'border-transparent hover:border-gray-300'
                          }`}
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setImageLoading(true);
                        }}
                      >
                        {thumbnailLoading[index] && (
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
                          </div>
                        )}
                        <Image
                          src={image}
                          alt={`${product.name} view ${index + 1}`}
                          fill
                          className={`object-cover transition-opacity duration-300 ${thumbnailLoading[index] ? 'opacity-0' : 'opacity-100'}`}
                          sizes="80px"
                          onLoad={() => setThumbnailLoading(prev => ({ ...prev, [index]: false }))}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {/* Main Image Container */}
                <div className="w-full max-w-xs lg:max-w-md mx-auto">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
                    {imageLoading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
                      </div>
                    )}
                    <Image
                      src={images[selectedImageIndex]}
                      alt={product.name}
                      fill
                      className={`object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                      sizes="(max-width: 480px) 90vw, (max-width: 768px) 60vw, 50vw"
                      priority
                      onLoad={() => setImageLoading(false)}
                    />
                  </div>
                  {/* Thumbnails - bottom on mobile only, less margin below */}
                  {hasMultipleImages && (
                    <div className="flex gap-2 mt-2 mb-2 overflow-x-auto pb-1 lg:hidden">
                      {images.slice(0, 6).map((image, index) => (
                        <div
                          key={index}
                          className={`relative aspect-square w-14 h-14 overflow-hidden rounded-lg cursor-pointer border-2 transition-all ${selectedImageIndex === index
                            ? 'border-blue-500'
                            : 'border-transparent hover:border-gray-300'
                            }`}
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setImageLoading(true);
                          }}
                        >
                          {thumbnailLoading[index] && (
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
                            </div>
                          )}
                          <Image
                            src={image}
                            alt={`${product.name} view ${index + 1}`}
                            fill
                            className={`object-cover transition-opacity duration-300 ${thumbnailLoading[index] ? 'opacity-0' : 'opacity-100'}`}
                            sizes="(max-width: 480px) 14vw, (max-width: 768px) 10vw, 80px"
                            onLoad={() => setThumbnailLoading(prev => ({ ...prev, [index]: false }))}
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
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                    {product.name}
                  </h1>
                  <div className="pt-2">
                    <ProductShareButton product={{
                      name: product.name,
                      shortDescription: product.shortDescription,
                      details: product.details
                    }} />
                  </div>
                </div>
                {/* Out of Stock Label */}
                {typeof product.inventory === 'number' && product.inventory < 1 && (
                  <span className="inline-block bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded ml-2 align-middle">Out of Stock</span>
                )}
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
              {/* Share Button moved inline with product name above */}
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
              {product.roundedDiscountPercentage && (
                <div className="inline-block bg-red-500 text-white px-2 py-1 rounded font-semibold text-xs mb-3">
                  {product.roundedDiscountPercentage}% OFF
                </div>
              )}

              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-gray-900 font-currency">
                  ₹{product.discountedPrice.toLocaleString('en-IN')}
                </span>
                {product.roundedDiscountPercentage && product.actualPrice && (
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
              {addItem && (
                <button
                  className={`w-full py-3 px-4 rounded-lg text-base font-semibold transition-colors flex items-center justify-center ${added ? 'bg-green-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                  disabled={added}
                  onClick={() => {
                    addItem(product);
                    setAdded(true);
                    setTimeout(() => {
                      if (router) router.push('/cart');
                    }, 1000);
                  }}
                >
                  {added ? (
                    <span className="flex items-center gap-2 animate-fade-in">
                      <svg className="w-5 h-5 text-white animate-bounce" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Added to Cart
                    </span>
                  ) : (
                    'Add to Cart'
                  )}
                </button>
              )}
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
                    <h4 className="text-lg font-medium text-gray-900 mb-1 ">Free Shipping</h4>
                    <p className="text-gray-700 text-sm font-currency">On orders above ₹4999. Delivery in 3-5 business days.</p>
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