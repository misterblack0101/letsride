'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-start lg:items-center justify-center py-0">
            <div className="w-full max-w-5xl flex flex-col-reverse lg:flex-row items-center lg:items-center justify-center gap-8 lg:gap-10 py-0 lg:pt-6">

                {/* Content: text and CTAs (left on desktop, stacked on mobile) */}
                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left mt-1 lg:mt-0">
                    <div>
                        <span className="inline-block bg-primary/10 text-primary font-semibold px-4 py-2 rounded text-lg">404</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-slate-800">Page not found</h2>

                    <p className="text-sm sm:text-base text-slate-600 max-w-md mt-3">
                        The page you are looking for doesn't exist or may have been moved. Try searching for products or head back to the homepage.
                    </p>

                    <div className="flex flex-row gap-3 mt-3 w-full sm:w-auto justify-center lg:justify-start">
                        <Link href="/" className="px-5 py-2 rounded-md shadow-sm max-w-xs text-sm inline-flex items-center justify-center bg-primary text-white font-semibold hover:bg-primary/90">Go Home</Link>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-slate-600 justify-center lg:justify-start">
                        <Link href="/products" className="hover:text-primary">Browse Products</Link>
                        <span className="text-slate-300">•</span>
                        <Link href="/cart" className="hover:text-primary">View Cart</Link>
                        <span className="text-slate-300">•</span>
                        <Link href="/products/bikes" className="hover:text-primary">Shop Bikes</Link>
                    </div>
                </div>

                {/* Illustration (right on desktop, above on mobile) */}
                <div className="flex-1 flex items-center justify-center">
                    {/* Mobile: rounded corners, no border. Desktop: remove rounding so layout stays unchanged */}
                    <div className="w-full max-w-sm overflow-hidden rounded-lg lg:rounded-none lg:max-w-md">
                        <Image
                            src="/images/404.png"
                            alt="Cyclist illustration"
                            width={720}
                            height={540}
                            className="w-full h-auto block"
                            priority
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
