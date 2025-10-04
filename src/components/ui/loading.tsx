'use client';

import React from 'react';
import dynamic from 'next/dynamic';
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

interface ProductGridSkeletonProps {
    viewMode?: 'grid' | 'list';
}

export function ProductGridSkeleton({ viewMode = 'grid' }: ProductGridSkeletonProps) {
    // Ensure this component only renders on the client side
    if (typeof window === 'undefined') {
        return null;
    }

    if (viewMode === 'list') {
        return (
            <div className="flex flex-col gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-200 animate-pulse h-32 sm:h-40">
                        <div className="flex w-full h-full">
                            {/* Image skeleton - matches ProductCard mobile/desktop sizing */}
                            <div className="w-30 h-30 sm:w-40 sm:h-40 bg-gray-200 rounded-l-xl flex-shrink-0"></div>

                            {/* Content skeleton - matches ProductCard responsive padding */}
                            <div className="flex-1 p-2 sm:p-3 flex flex-col justify-between">
                                {/* Top section */}
                                <div className="space-y-2">
                                    {/* Brand and Rating row */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                                    </div>

                                    {/* Product title */}
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>

                                    {/* Short description */}
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>

                                {/* Bottom section - Pricing */}
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                                    </div>
                                    {/* <div className="w-6 h-6 bg-gray-200 rounded-full"></div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-200 animate-pulse overflow-hidden">
                    {/* Image skeleton - aspect-square to match ProductCard */}
                    <div className="aspect-square bg-gray-200"></div>

                    {/* Content skeleton - matches ProductCard mobile responsive padding */}
                    <div className="p-1.5 sm:p-2 space-y-1">
                        {/* Brand and Rating row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                <div className="h-3 bg-gray-200 rounded w-12"></div>
                            </div>
                            <div className="h-3 bg-gray-200 rounded w-8"></div>
                        </div>

                        {/* Product title - single line to match truncation */}
                        <div className="h-4 bg-gray-200 rounded w-4/5"></div>

                        {/* Pricing */}
                        <div className="flex items-center gap-1.5">
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                            <div className="h-3 bg-gray-200 rounded w-8"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
