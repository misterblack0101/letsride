"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import LoginForm from './LoginForm';
import AdminPanel from './AdminPanel';

export default function AdminLogin() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check login status via cookies
        const checkLoginStatus = () => {
            const authCookie = Cookies.get('auth');
            setIsLoggedIn(!!authCookie);
        };

        checkLoginStatus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password }),
            });

            if (response.ok) {
                // Set auth cookie
                const { token } = await response.json();
                // document.cookie = `auth=${token}; path=/; max-age=${30 * 24 * 60 * 60}`;
                // router.push('/admin/panel');
                setIsLoggedIn(true);
                router.refresh(); // Refresh to update auth state
            } else {
                const data = await response.json();
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    const handleLogout = () => {
        document.cookie = 'auth=; path=/; max-age=0';
        setIsLoggedIn(false);
    };

    if (isLoggedIn) {
        return AdminPanel;
    }

    return (
        <div className="flex items-center justify-center min-h-screen ">
            <LoginForm
                id={id}
                setId={setId}
                password={password}
                setPassword={setPassword}
                error={error}
                setError={setError}
                handleSubmit={handleSubmit}
            />
        </div>
    );
}
