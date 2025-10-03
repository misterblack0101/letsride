'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

/**
 * Firebase Authentication Context for Admin Authentication.
 * 
 * **Features:**
 * - Email/password authentication using Firebase Auth
 * - Persistent authentication state across sessions
 * - Automatic token refresh
 * - Protected route access control
 * 
 * **Usage:**
 * ```tsx
 * const { user, signIn, signOut, loading, getIdToken } = useAuth();
 * 
 * // Sign in
 * await signIn('admin@example.com', 'password');
 * 
 * // Get current ID token for API calls
 * const token = await getIdToken();
 * 
 * // Sign out
 * await signOut();
 * ```
 */

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Set persistence to LOCAL (survives browser restarts)
        setPersistence(auth, browserLocalPersistence).catch((error) => {
            console.error('Error setting auth persistence:', error);
        });

        // Subscribe to auth state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    /**
     * Sign in with email and password
     */
    const signIn = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            console.error('Sign in error:', error);
            throw new Error(error.message || 'Failed to sign in');
        }
    };

    /**
     * Sign out the current user
     */
    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error: any) {
            console.error('Sign out error:', error);
            throw new Error(error.message || 'Failed to sign out');
        }
    };

    /**
     * Get the current user's ID token for API authentication
     */
    const getIdToken = async (): Promise<string | null> => {
        if (!user) return null;

        try {
            const token = await user.getIdToken();
            return token;
        } catch (error) {
            console.error('Error getting ID token:', error);
            return null;
        }
    };

    const value = {
        user,
        loading,
        signIn,
        signOut,
        getIdToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use authentication context
 * 
 * @throws Error if used outside AuthProvider
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
