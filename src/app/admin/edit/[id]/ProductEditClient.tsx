'use client';

import { useRouter } from 'next/navigation';
import { Product } from '@/lib/models/Product';
import ProductForm from '../../components/ProductForm';

/**
 * Product Edit Client Component
 * 
 * **Architecture:**
 * - Client-side wrapper for ProductForm
 * - Handles navigation after successful edit
 * - Manages cancel behavior to return to admin
 * 
 * **Features:**
 * - Edit existing product using ProductForm
 * - Navigate back to admin after save/cancel
 * - Pass product data as props to form
 */

interface ProductEditClientProps {
    product: Product;
}

export default function ProductEditClient({ product }: ProductEditClientProps) {
    const router = useRouter();

    /**
     * Handle successful product save - navigate back to admin
     */
    const handleSuccess = () => {
        router.push('/admin');
    };

    /**
     * Handle cancel - navigate back to admin
     */
    const handleCancel = () => {
        router.push('/admin');
    };

    return (
        <ProductForm
            product={product}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
        />
    );
}