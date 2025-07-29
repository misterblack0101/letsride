'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ClientRecommendedProducts({ products }: { products: any[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    };

    const scroll = (dir: 'left' | 'right') => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({
            left: dir === 'left' ? -300 : 300,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        updateScrollButtons();
        const el = scrollRef.current;
        if (!el) return;

        el.addEventListener('scroll', updateScrollButtons);
        window.addEventListener('resize', updateScrollButtons);

        return () => {
            el.removeEventListener('scroll', updateScrollButtons);
            window.removeEventListener('resize', updateScrollButtons);
        };
    }, []);

    return (
        <div className="mt-12">
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl font-bold">Recommended Products</h2>
                <Link href="/products" className="text-primary hover:underline flex items-center gap-1">
                    See All <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="relative px-4">
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-base-100 p-2 rounded-full shadow hover:bg-primary hover:text-white transition"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft />
                    </button>
                )}

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-4 pb-4 scroll-smooth scrollbar-hide snap-x snap-mandatory"
                >
                    {products.map((product: any) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="flex-shrink-0 w-[70%] sm:w-[45%] md:w-[30%] lg:w-[22%] xl:w-[18%] card bg-base-100 shadow-md hover:shadow-xl transition duration-300 rounded-lg snap-start"
                        >
                            <figure className="p-4">
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    width={300}
                                    height={300}
                                    className="w-full h-40 object-contain rounded-md"
                                    loading="lazy"
                                />
                            </figure>
                            <div className="card-body items-center text-center p-4">
                                <h3 className="card-title text-base font-semibold">{product.name}</h3>
                                <p className="text-primary text-lg font-bold font-currency">₹{product.price}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-base-100 p-2 rounded-full shadow hover:bg-primary hover:text-white transition"
                        aria-label="Scroll right"
                    >
                        <ChevronRight />
                    </button>
                )}
            </div>
        </div>
    );
}
