'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Product } from '@/lib/models/Product';
import ProductForm from '../../components/ProductForm';

/**
 * Product Edit Client Component
 * 
 * **Architecture:**
 * - Client-side wrapper for ProductForm with auth protection
 * - Handles navigation after successful edit
 * - Manages cancel behavior to return to admin
 * - Redirects unauthenticated users to home page
 * 
 * **Features:**
 * - Edit existing product using ProductForm
 * - Navigate back to admin after save/cancel
 * - Pass product data as props to form
 * - Firebase authentication check
 */

interface ProductEditClientProps {
    product: Product;
}

export default function ProductEditClient({ product }: ProductEditClientProps) {
    const router = useRouter();
    const { user, loading } = useAuth();

    /**
     * Redirect to home if not authenticated
     */
    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    /**
     * Show loading state while checking authentication
     */
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    /**
     * Don't render form if not authenticated
     */
    if (!user) {
        return null;
    }

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