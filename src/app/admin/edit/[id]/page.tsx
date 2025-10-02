import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/server/products.server';
import ProductEditClient from './ProductEditClient';

/**
 * Admin Product Edit Page - Server Component
 * 
 * **Architecture:**
 * - Server-side product fetching for initial data
 * - Client component handles form interactions
 * - Protected admin route via middleware
 * 
 * **Features:**
 * - Individual product editing with existing ProductForm
 * - Navigation back to search interface after save
 * - Error handling for missing products
 */

interface ProductEditPageProps {
    params: {
        id: string;
    };
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
    const { id } = params;

    try {
        // Fetch product data server-side
        const product = await getProductById(id);

        if (!product) {
            notFound();
        }

        return <ProductEditClient product={product} />;
    } catch (error) {
        console.error('Error fetching product:', error);
        notFound();
    }
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: ProductEditPageProps) {
    const { id } = params;

    try {
        const product = await getProductById(id);

        return {
            title: `Edit ${product?.name || 'Product'} | Admin`,
            description: `Edit product details for ${product?.name || 'this product'}`,
        };
    } catch {
        return {
            title: 'Edit Product | Admin',
            description: 'Edit product details',
        };
    }
}