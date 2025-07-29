'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function NotFound() {
    return (
        <div className="h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl h-full flex items-center justify-center">

                {/* Mobile View */}
                <div className="lg:hidden flex flex-col items-center justify-center text-center h-full w-full">
                    {/* Cyclist Image */}
                    <div className="mb-4">
                        <Image
                            src="/images/cycle_404.png"
                            alt="Cyclist illustration"
                            width={300}
                            height={225}
                            className="w-full max-w-[200px] sm:max-w-[250px] h-auto mx-auto"
                            priority
                        />
                    </div>

                    {/* 404 Text */}
                    <div>
                        <h1 className="text-6xl sm:text-7xl font-bold text-slate-700 mb-2 sm:mb-3 select-none leading-none">
                            404
                        </h1>
                    </div>

                    {/* Page not found Text */}
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-700 mb-2 sm:mb-3 leading-tight">
                            Page not<br />found
                        </h2>
                    </div>

                    {/* Description */}
                    <div>
                        <p className="text-sm sm:text-base text-slate-600 mb-4 max-w-md mx-auto px-4">
                            Sorry, the page you are looking for doesn't exist or has been moved.
                        </p>
                    </div>

                    {/* Go Home Button */}
                    <div className="mb-3">
                        <Link
                            href="/"
                            className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg text-sm sm:text-base"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Go Back Home
                        </Link>
                    </div>

                    {/* Additional helpful links */}
                    <div>
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm px-4">
                            <Link href="/products" className="text-slate-500 hover:text-blue-600">
                                Browse Products
                            </Link>
                            <span className="text-slate-300">•</span>
                            <Link href="/cart" className="text-slate-500 hover:text-blue-600">
                                View Cart
                            </Link>
                            <span className="text-slate-300">•</span>
                            <Link href="/products/bikes" className="text-slate-500 hover:text-blue-600">
                                Shop Bikes
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Desktop View */}
                <div className="hidden lg:flex items-center justify-between w-full h-full">
                    {/* Left side - Text content */}
                    <div className="flex-1 text-left">
                        {/* 404 Text */}
                        <div>
                            <h1 className="text-8xl lg:text-[8rem] xl:text-[10rem] font-bold text-slate-700 mb-4 select-none leading-none">
                                404
                            </h1>
                        </div>

                        {/* Page not found Text */}
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-slate-700 mb-4 leading-tight">
                                Page not<br />found
                            </h2>
                        </div>

                        {/* Description */}
                        <div>
                            <p className="text-lg lg:text-xl text-slate-600 mb-6 max-w-md">
                                Sorry, the page you are looking for doesn't exist or has been moved.
                            </p>
                        </div>

                        {/* Go Home Button */}
                        <div>
                            <Link
                                href="/"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Go Back Home
                            </Link>
                        </div>

                        {/* Additional helpful links */}
                        <div className="mt-4">
                            <div className="flex flex-wrap gap-4 text-sm">
                                <Link href="/products" className="text-slate-500 hover:text-blue-600">
                                    Browse Products
                                </Link>
                                <span className="text-slate-300">•</span>
                                <Link href="/cart" className="text-slate-500 hover:text-blue-600">
                                    View Cart
                                </Link>
                                <span className="text-slate-300">•</span>
                                <Link href="/products/bikes" className="text-slate-500 hover:text-blue-600">
                                    Shop Bikes
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Cyclist Image */}
                    <div className="flex-1 flex justify-end">
                        <div className="relative">
                            <Image
                                src="/images/cycle_404.png"
                                alt="Cyclist illustration"
                                width={400}
                                height={300}
                                className="w-full max-w-lg h-auto"
                                priority
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
