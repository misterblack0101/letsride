"use client";

import { FormEvent, useState } from 'react';
import { useAuth } from '@/context/auth-context';

/**
 * Firebase Authentication Login Form for Admin Access.
 * 
 * **Features:**
 * - Email/password authentication using Firebase Auth
 * - Error handling with user-friendly messages
 * - Loading states during authentication
 * - Automatic redirect on successful login
 * 
 * **Authentication Flow:**
 * 1. User enters email and password
 * 2. Firebase Auth validates credentials
 * 3. On success, user object is set in auth context
 * 4. Parent component (admin page) handles navigation
 * 
 * **Usage:**
 * ```tsx
 * <LoginForm setIsloggedIn={(val) => setLoggedIn(val)} />
 * ```
 */

export default function LoginForm(
    {
        setIsloggedIn
    }: {
        setIsloggedIn: (isLoggedIn: boolean) => void;
    }
) {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signIn(email, password);
            setIsloggedIn(true);
        } catch (err: any) {
            console.error('Login error:', err);

            // Provide user-friendly error messages
            let errorMessage = 'An error occurred. Please try again.';
            if (err.message?.includes('invalid-credential') || err.message?.includes('user-not-found') || err.message?.includes('wrong-password')) {
                errorMessage = 'Invalid email or password';
            } else if (err.message?.includes('too-many-requests')) {
                errorMessage = 'Too many failed attempts. Please try again later.';
            } else if (err.message?.includes('network')) {
                errorMessage = 'Network error. Please check your connection.';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen ">
            <form onSubmit={onSubmit} className="p-6 bg-white rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                        disabled={loading}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                        disabled={loading}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}
