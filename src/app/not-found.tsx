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
                    <div className="mb-3 flex flex-col gap-2 w-full max-w-xs mx-auto">
                        <Link
                            href="/"
                            className="btn btn-primary btn-lg w-full"
                        >
                            Go Home
                        </Link>

                        <Link
                            href="/search"
                            className="btn btn-outline btn-lg w-full"
                        >
                            Search Products
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
                        <div className="flex gap-4 mb-8">
                            <Link
                                href="/"
                                className="btn btn-primary btn-lg"
                            >
                                Go Home
                            </Link>

                            <Link
                                href="/search"
                                className="btn btn-outline btn-lg"
                            >
                                Search Products
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
