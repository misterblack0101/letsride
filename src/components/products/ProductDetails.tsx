"use client";

import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/models/Product';
import { Star, ShoppingCart, Package, Tag, Award, Truck } from 'lucide-react';

export default function ProductDetails({ product }: { product: Product }) {
  const { addItem } = useCart();

  // Calculate savings if there's a discount
  const savings = product.discountPercentage
    ? product.price - product.discountedPrice
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <div className="text-sm breadcrumbs mb-6">
        <ul>
          <li><a href="/" className="text-primary hover:text-primary-focus">Home</a></li>
          <li><a href="/products" className="text-primary hover:text-primary-focus">Products</a></li>
          <li><a href={`/products/${product.category}`} className="text-primary hover:text-primary-focus">{product.category}</a></li>
          <li className="text-base-content/70">{product.name}</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-0">
              <div className="aspect-square relative overflow-hidden rounded-lg">
                <Image
                  src={product.images?.[0] || "/images/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {product.discountPercentage && (
                  <div className="badge badge-secondary badge-lg absolute top-4 left-4 font-bold">
                    {product.discountPercentage}% OFF
                  </div>
                )}
                {product.isRecommended && (
                  <div className="badge badge-warning badge-lg absolute top-4 right-4 font-bold">
                    <Award className="w-4 h-4 mr-1" />
                    Recommended
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((image, index) => (
                <div key={index} className="aspect-square relative overflow-hidden rounded-lg border-2 border-base-300 hover:border-primary cursor-pointer transition-colors">
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 12.5vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Product Title and Basic Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="badge badge-outline badge-lg">{product.category}</div>
              <div className="badge badge-primary badge-lg">{product.subCategory}</div>
              {product.brand && (
                <div className="badge badge-accent badge-lg">{product.brand}</div>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold font-headline text-base-content mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="rating rating-sm">
                {[1, 2, 3, 4, 5].map((star) => (
                  <input
                    key={star}
                    type="radio"
                    name="rating"
                    className={`mask mask-star-2 ${star <= Math.floor(product.rating) ? 'bg-warning' : 'bg-base-300'
                      }`}
                    disabled
                    checked={star === Math.floor(product.rating)}
                    readOnly
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">{product.rating}</span>
              <span className="text-base-content/70">({Math.floor(product.rating * 100)} reviews)</span>
            </div>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <div className="alert alert-info">
              <Package className="w-5 h-5" />
              <span>{product.shortDescription}</span>
            </div>
          )}

          {/* Pricing */}
          <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl md:text-4xl font-bold font-currency text-primary ">
                      ₹{product.discountedPrice.toLocaleString('en-IN')}
                    </span>
                    {product.discountPercentage && (
                      <span className="text-xl text-base-content/70 line-through font-currency">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  {savings > 0 && (
                    <div className="text-success font-semibold font-currency">
                      You save ₹{savings.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-primary btn-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  onClick={() => addItem(product)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Product Details */}
          {product.details && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">
                  <Tag className="w-5 h-5" />
                  Product Details
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-base-content/80 whitespace-pre-line leading-relaxed">
                    {product.details}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Product Specifications */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-xl mb-4">
                <Package className="w-5 h-5" />
                Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Category</div>
                  <div className="stat-value text-lg">{product.category}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Sub Category</div>
                  <div className="stat-value text-lg">{product.subCategory}</div>
                </div>
                {product.brand && (
                  <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-title">Brand</div>
                    <div className="stat-value text-lg">{product.brand}</div>
                  </div>
                )}
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Rating</div>
                  <div className="stat-value text-lg flex items-center gap-1">
                    <Star className="w-5 h-5 text-warning fill-warning" />
                    {product.rating}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="alert alert-success">
            <Truck className="w-5 h-5" />
            <div>
              <h4 className="font-semibold">Free Shipping</h4>
              <p className="text-sm font-currency">On orders above ₹999. Delivery in 3-5 business days.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Product Info */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center">
            <Package className="w-12 h-12 mx-auto text-primary mb-4" />
            <h3 className="card-title justify-center">Quality Assured</h3>
            <p className="text-base-content/70">All products are tested for quality and durability</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center">
            <Truck className="w-12 h-12 mx-auto text-primary mb-4" />
            <h3 className="card-title justify-center">Fast Delivery</h3>
            <p className="text-base-content/70">Quick and secure delivery to your doorstep</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center">
            <Award className="w-12 h-12 mx-auto text-primary mb-4" />
            <h3 className="card-title justify-center">Warranty</h3>
            <p className="text-base-content/70">Manufacturer warranty included with purchase</p>
          </div>
        </div>
      </div>
    </div>
  );
}
