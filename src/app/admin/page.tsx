"use client";

import { useState, useEffect, useRef } from 'react';
import LoginForm from './LoginForm';
import AdminPanel from './AdminPanel';

export default function AdminLogin() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const hasCheckedLogin = useRef(false);

    // Check login status via cookies
    const checkLoginStatus = async () => {
        if (hasCheckedLogin.current) return;
        hasCheckedLogin.current = true;

        const response = await fetch('/api/admin/verify', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setError('');

    //     try {
    //         const response = await fetch('/api/admin/login', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ id, password }),
    //         });
    //         console.log(response);

    //         if (response.ok) {
    //             console.log('Login successful, redirecting to admin panel');

    //             setIsLoggedIn(true);
    //         } else {
    //             const data = await response.json();
    //             setError(data.message || 'Invalid credentials');
    //         }
    //     } catch (err) {
    //         console.error('Fetch request failed:', err); // Log detailed error
    //         setError('An error occurred. Please try again.');
    //     }
    // };

    const handleLogout = async () => {
        // Clear cookies and reset login state
        await fetch('/api/admin/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        setIsLoggedIn(false);
    };

    if (isLoggedIn) {
        return <AdminPanel
            logoutCallback={handleLogout} />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen ">
            <LoginForm
                setIsloggedIn={setIsLoggedIn}
            />
        </div>
    );
}
