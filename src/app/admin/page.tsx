"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import LoginForm from './LoginForm';
import AdminPanel from './AdminPanel';

/**
 * Admin Page with Firebase Authentication Protection.
 * 
 * **Features:**
 * - Automatic authentication check on page load
 * - Redirect to home if not authenticated
 * - Firebase Auth integration for secure access
 * - Loading state during authentication check
 * 
 * **Flow:**
 * 1. Check if user is authenticated via Firebase Auth
 * 2. If not authenticated, show login form
 * 3. If authenticated, show admin panel
 * 4. Handle sign out and cleanup
 */

export default function AdminLogin() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show admin panel if authenticated
    if (user) {
        return <AdminPanel logoutCallback={handleLogout} />;
    }

    // Show login form if not authenticated
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoginForm setIsloggedIn={() => { }} />
        </div>
    );
}
