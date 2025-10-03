"use client";
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/models/Product';
import ProductDetails from './ProductDetails';

/**
 * Client-only wrapper for product details, handles cart actions and UI hooks.
 * Receives product data from SSR parent.
 */
export default function ProductDetailsClient({ product }: { product: Product }) {
    const { addItem } = useCart();
    return <ProductDetails product={product} addItem={addItem} />;
}
