'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';

type CategoryData = {
    [category: string]: string[];
};

export default function MegaMenu({ data }: { data: CategoryData }) {
    const [openCategory, setOpenCategory] = useState<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (category: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpenCategory(category);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setOpenCategory(null);
        }, 200); // small delay to allow user to move to dropdown
    };

    return (
        <div className='w-fit mx-auto'>
            <div className="flex gap-6 items-center">
                {Object.entries(data).map(([category, subcategories]) => (
                    <div
                        key={category}
                        className="relative"
                        onMouseEnter={() => handleMouseEnter(category)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button className="font-medium hover:text-primary transition-colors">
                            {category}
                            <svg
                                className="inline-block ml-1 w-4 h-4 text-gray-500 transition-transform duration-200"
                                style={{ transform: openCategory === category ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown */}
                        <div
                            className={`absolute top-full left-0 mt-2 w-48 z-50 transition-opacity transform duration-200 ${openCategory === category ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                                } bg-white shadow-md rounded border border-gray-200`}
                        >
                            {subcategories.map((subcat) => (
                                <Link
                                    key={subcat}
                                    href={`/products/${encodeURIComponent(category)}/${encodeURIComponent(subcat)}`}
                                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                    {subcat}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
