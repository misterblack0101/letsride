'use client';

import { useRouter } from 'next/navigation';
import ProductForm from '../components/ProductForm';

/**
 * New Product Page - Client Component
 * 
 * **Architecture:**
 * - Client-side form for creating new products
 * - Uses existing ProductForm component
 * - Navigates back to admin search after creation
 * 
 * **Features:**
 * - Create new product using ProductForm
 * - Navigate back to admin after save/cancel
 * - No pre-filled product data (new creation)
 */

export default function NewProductPage() {
    const router = useRouter();

    /**
     * Handle successful product creation - navigate back to admin
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
            onSuccess={handleSuccess}
            onCancel={handleCancel}
        />
    );
}