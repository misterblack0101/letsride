'use client';

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`} />
    );
}

interface LottieLoadingProps {
    size?: 'sm' | 'md' | 'lg';
    fullscreen?: boolean;
    className?: string;
}

export function LottieLoading({ size = 'md', fullscreen = true, className = '' }: LottieLoadingProps) {
    const sizes = {
        sm: { width: '100px', height: '100px' },
        md: { width: '200px', height: '200px' },
        lg: { width: '300px', height: '300px' },
    };

    const containerStyle = fullscreen
        ? {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            width: "100%",
            background: "#fffdf9",
            position: "fixed" as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
        }
        : {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            width: "100%",
        };

    // Responsive sizing for mobile
    const responsiveSize = {
        width: fullscreen ? 'min(200px, 50vw)' : sizes[size].width,
        height: fullscreen ? 'min(200px, 50vw)' : sizes[size].height,
        maxWidth: '100%',
        maxHeight: '100%',
    };

    return (
        <div style={containerStyle} role="status" className={`${className}`}>
            <div style={responsiveSize}>
                <DotLottieReact
                    src="/lottie/cycling.lottie"
                    loop
                    autoplay
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                />
            </div>

            <span
                style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    padding: 0,
                    margin: -1,
                    overflow: "hidden",
                    clip: "rect(0,0,0,0)",
                    whiteSpace: "nowrap",
                    border: 0,
                }}
            >
                Loading…
            </span>
        </div>
    );
}

interface LoadingStateProps {
    message?: string;
    className?: string;
}

export function LoadingState({ message = 'Loading...', className = '' }: LoadingStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
            <LottieLoading size="md" fullscreen={false} className="mb-4" />
            <p className="text-lg text-muted-foreground">{message}</p>
        </div>
    );
}

export function ProductGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
