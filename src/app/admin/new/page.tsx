'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import ProductForm from '../components/ProductForm';

/**
 * New Product Page - Client Component with Auth Protection
 * 
 * **Architecture:**
 * - Client-side form for creating new products
 * - Uses existing ProductForm component
 * - Navigates back to admin search after creation
 * - Redirects unauthenticated users to home page
 * 
 * **Features:**
 * - Create new product using ProductForm
 * - Navigate back to admin after save/cancel
 * - No pre-filled product data (new creation)
 * - Firebase authentication check
 */

export default function NewProductPage() {
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