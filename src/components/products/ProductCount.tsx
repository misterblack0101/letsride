'use client';

import { useEffect, useState, useRef } from 'react';

interface ProductCountProps {
    totalCount: number;
    currentPage: number;
    pageSize: number;
    currentSubcategory?: string;
    currentCategory?: string;
}

export default function ProductCount({
    totalCount,
    currentPage,
    pageSize,
    currentCategory,
    currentSubcategory,
}: ProductCountProps) {
    const [isLoading, setIsLoading] = useState(false);
    const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Create a dependency string to detect when props change
    const depString = `${totalCount}-${currentPage}-${pageSize}-${currentCategory}-${currentSubcategory}`;

    // Setup pagination event handling
    useEffect(() => {
        const handlePageChange = () => {
            setIsLoading(true);
            // Set safety timer to prevent stuck loading state
            if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
            safetyTimerRef.current = setTimeout(() => setIsLoading(false), 3000);
        };

        window.addEventListener('paginationStart', handlePageChange);

        return () => {
            window.removeEventListener('paginationStart', handlePageChange);
            if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
        };
    }, []);

    // Reset loading state when props change
    useEffect(() => {
        setIsLoading(false);
    }, [depString]);

    if (totalCount === 0) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
                <div className="h-5 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
        );
    }

    return (
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing {Math.min(pageSize * (currentPage - 1) + 1, totalCount)} to {Math.min(pageSize * currentPage, totalCount)} of {totalCount} products
            {currentSubcategory ? ` in ${currentSubcategory}` : currentCategory ? ` in ${currentCategory}` : ''}
        </p>
    );
}
