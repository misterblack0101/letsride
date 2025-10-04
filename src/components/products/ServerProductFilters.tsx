'use client';

import React, { useTransition, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import PriceRangeFilter from './PriceRangeFilter';

/**
 * Props for ServerProductFilters component.
 * 
 * @interface ServerProductFiltersProps
 */
type ServerProductFiltersProps = {
    /** Available brand options for filtering */
    availableBrands: string[];
    /** Available category options for filtering (used in general product pages) */
    availableCategories: string[];
    /** Currently selected categories */
    selectedCategories: string[];
    /** Currently selected brands */
    selectedBrands: string[];
    /** Current minimum price filter value */
    selectedMinPrice?: number;
    /** Current maximum price filter value */
    selectedMaxPrice?: number;
    /** Current category context (for category-specific pages) */
    currentCategory?: string;
    /** Current subcategory context (for subcategory-specific pages) */
    currentSubcategory?: string;
    /** Available subcategories in current category */
    currentSubcategories?: string[];
};

/**
 * Advanced product filtering component with URL-based state management.
 * 
 * **Architecture:**
 * - Client component that manages filter state via URL search parameters
 * - Supports both general product pages and category/subcategory specific pages
 * - Responsive design with mobile sheet and desktop sidebar layouts
 * - Real-time URL updates trigger server-side re-rendering
 * 
 * **URL Management:**
 * - Builds appropriate URLs based on current page context
 * - Preserves category/subcategory routes while updating filters
 * - Cleans up empty filter parameters from URL
 * 
 * **Usage Contexts:**
 * 1. `/products` - General product browsing with category filters
 * 2. `/products/[category]` - Category-specific filtering
 * 3. `/products/[category]/[subcategory]` - Subcategory-specific filtering
 * 
 * @param props - Filter configuration and current state
 * 
 * @example
 * ```tsx
 * // General products page
 * <ServerProductFilters
 *   availableBrands={['Trek', 'Giant']}
 *   availableCategories={['Bikes', 'Accessories']}
 *   selectedBrands={['Trek']}
 *   selectedCategories={[]}
 * />
 * 
 * // Category-specific page  
 * <ServerProductFilters
 *   availableBrands={['Trek', 'Giant']}
 *   currentCategory="Bikes"
 *   currentSubcategories={['Mountain', 'Road']}
 *   selectedBrands={[]}
 * />
 * ```
 */
export default function ServerProductFilters({
    availableBrands,
    availableCategories,
    selectedCategories,
    selectedBrands,
    selectedMinPrice,
    selectedMaxPrice,
    currentCategory,
    currentSubcategory,
    currentSubcategories
}: ServerProductFiltersProps) {
    // Ensure this component only renders on the client side
    if (typeof window === 'undefined') {
        return null;
    }

    const router = useRouter();
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();
    const [isPending, startTransition] = useTransition();
    const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

    // Local state for instant UI feedback
    const [localSelectedBrands, setLocalSelectedBrands] = useState<string[]>(selectedBrands);
    const [localSelectedCategories, setLocalSelectedCategories] = useState<string[]>(selectedCategories);

    // Sync local state with props when they change (from server)
    useEffect(() => {
        setLocalSelectedBrands(selectedBrands);
    }, [selectedBrands]);

    useEffect(() => {
        setLocalSelectedCategories(selectedCategories);
    }, [selectedCategories]);

    /**
     * Updates URL search parameters and navigates to the new URL.
     * 
     * **URL Building Logic:**
     * 1. Preserves current page context (general/category/subcategory)
     * 2. Adds/updates filter parameters
     * 3. Removes empty or null parameters to keep URLs clean
     * 4. Handles array parameters (brands, categories) correctly
     * 
     * **Navigation Behavior:**
     * - Triggers server-side re-render with new filters
     * - Maintains browser history for back/forward navigation
     * - Preserves SEO-friendly URL structure
     * 
     * @param updates - Object with parameter updates (null removes parameter)
     */
    const updateURL = (updates: Record<string, string | string[] | null>) => {
        const params = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || (Array.isArray(value) && value.length === 0)) {
                params.delete(key);
            } else if (Array.isArray(value)) {
                params.delete(key);
                value.forEach(v => params.append(key, v));
            } else {
                params.set(key, value);
            }
        });

        // Reset pagination when filters change (except when only page/lastId is being updated)
        const isOnlyPaginationUpdate = Object.keys(updates).every(key =>
            key === 'page' || key === 'lastId'
        );

        if (!isOnlyPaginationUpdate) {
            params.delete('page');
            params.delete('lastId');
        }

        // Determine the base URL based on context
        let baseUrl = '/products';

        // If we're viewing a specific category
        if (currentCategory) {
            if (currentSubcategory) {
                // We're in a subcategory view
                baseUrl = `/products/${encodeURIComponent(currentCategory)}/${encodeURIComponent(currentSubcategory)}`;
            } else {
                // We're in a category view
                baseUrl = `/products/${encodeURIComponent(currentCategory)}`;
            }
        }

        router.push(`${baseUrl}?${params.toString()}`);

        // Close sheet on mobile after applying filters
        setIsSheetOpen(false);
    };

    /**
     * Handles category filter checkbox changes with instant UI feedback.
     * Updates local state immediately, then navigates with loading state.
     */
    const handleCategoryChange = (category: string, checked: boolean) => {
        // Update local state instantly for immediate UI feedback
        const newCategories = checked
            ? [...localSelectedCategories, category]
            : localSelectedCategories.filter(c => c !== category);

        setLocalSelectedCategories(newCategories);

        // Dispatch event to trigger loading state in ProductGrid
        window.dispatchEvent(new CustomEvent('filterChangeStart'));

        // Use transition for smooth navigation
        startTransition(() => {
            updateURL({ category: newCategories });
        });
    };

    /**
     * Handles brand filter checkbox changes with instant UI feedback.
     * Updates local state immediately, then navigates with loading state.
     */
    const handleBrandChange = (brand: string, checked: boolean) => {
        // Update local state instantly for immediate UI feedback
        const newBrands = checked
            ? [...localSelectedBrands, brand]
            : localSelectedBrands.filter(b => b !== brand);

        setLocalSelectedBrands(newBrands);

        // Dispatch event to trigger loading state in ProductGrid
        window.dispatchEvent(new CustomEvent('filterChangeStart'));

        // Use transition for smooth navigation
        startTransition(() => {
            updateURL({ brand: newBrands });
        });
    };

    /**
     * Handles price range filter changes from PriceRangeFilter component.
     * Updates URL with new price range parameters.
     */
    const handlePriceChange = (minPrice: number | undefined, maxPrice: number | undefined) => {
        updateURL({
            minPrice: minPrice?.toString() || null,
            maxPrice: maxPrice?.toString() || null
        });
    };

    /**
     * Clears all active filters while preserving current page context.
     * 
     * **Context Preservation:**
     * - General products page: navigates to `/products`
     * - Category page: navigates to `/products/[category]`
     * - Subcategory page: navigates to `/products/[category]/[subcategory]`
     */
    const clearAllFilters = () => {
        // If we're in a category or subcategory context, stay there but clear other filters
        if (currentCategory) {
            if (currentSubcategory) {
                router.push(`/products/${encodeURIComponent(currentCategory)}/${encodeURIComponent(currentSubcategory)}`);
            } else {
                router.push(`/products/${encodeURIComponent(currentCategory)}`);
            }
        } else {
            // If not in a category context, go back to all products
            router.push('/products');
        }

        // Close sheet on mobile after clearing filters
        setIsSheetOpen(false);
    };

    /** Determines if any filters are currently active for UI state */
    const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || selectedMinPrice !== undefined || selectedMaxPrice !== undefined;

    const FilterContent = () => (
        <div className="space-y-6">
            {/* Clear all filters */}
            {hasActiveFilters && (
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">Active Filters</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-xs"
                    >
                        Clear All
                    </Button>
                </div>
            )}

            {/* Category Filter - only show if not in a category context */}
            {!currentCategory && availableCategories.length > 0 && (
                <>
                    <div>
                        <h3 className="font-bold mb-3">Categories</h3>
                        <div className="space-y-1">
                            {availableCategories.map(category => (
                                <div key={category}>
                                    <a
                                        href={`/products/${encodeURIComponent(category)}`}
                                        className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors cursor-pointer group focus:bg-primary/10 focus:text-primary active:bg-primary/20 hover:bg-primary/10 hover:text-primary"
                                        style={{ WebkitTapHighlightColor: 'transparent' }}
                                    >
                                        <span className="capitalize">{category}</span>
                                        <svg
                                            className="w-4 h-4 text-gray-400 group-hover:text-primary group-focus:text-primary transition-colors"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Separator />
                </>
            )}

            {/* Subcategory filter - only show if in a category but not in a subcategory */}
            {currentCategory && !currentSubcategory && currentSubcategories && currentSubcategories.length > 0 && (
                <>
                    <div>
                        <h3 className="font-bold mb-3">Subcategories</h3>
                        <div className="space-y-1">
                            {currentSubcategories.map(subcat => (
                                <div key={subcat}>
                                    <a
                                        href={`/products/${encodeURIComponent(currentCategory)}/${encodeURIComponent(subcat)}`}
                                        className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors cursor-pointer group focus:bg-primary/10 focus:text-primary active:bg-primary/20 hover:bg-primary/10 hover:text-primary"
                                        style={{ WebkitTapHighlightColor: 'transparent' }}
                                    >
                                        <span>{subcat}</span>
                                        <svg
                                            className="w-4 h-4 text-gray-400 group-hover:text-primary group-focus:text-primary transition-colors"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Separator />
                </>
            )}

            {/* Brand Filter */}
            <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                    Brand
                    {isPending && (
                        <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m 4,12 a 8,8 0 0 1 8,-8 V 0 l 3,4 -3,4 v -4 a 4,4 0 0 0 -4,4 z"></path>
                        </svg>
                    )}
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableBrands.map(brand => (
                        <div key={brand} className="flex items-center space-x-2">
                            <Checkbox
                                id={`brand-${brand}`}
                                checked={localSelectedBrands.includes(brand)}
                                onCheckedChange={(checked) =>
                                    handleBrandChange(brand, checked as boolean)
                                }
                                disabled={isPending}
                            />
                            <Label
                                htmlFor={`brand-${brand}`}
                                className={`text-sm cursor-pointer ${isPending ? 'opacity-50' : ''}`}
                            >
                                {brand}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Range Filter */}
            <div>
                <Separator className="mb-4" />
                <PriceRangeFilter
                    minPrice={selectedMinPrice}
                    maxPrice={selectedMaxPrice}
                    onPriceChange={handlePriceChange}
                />
            </div>
        </div>
    );

    // Show button for mobile and tablet (non-desktop)
    if (isMobile) {
        return (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        className="justify-start min-w-24 h-10 border-gray-200"
                        style={{
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            transition: 'background-color 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                    >
                        <Filter className="w-3 h-3 mr-1" />
                        Filters
                        {hasActiveFilters && (
                            <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                {selectedCategories.length + selectedBrands.length + (selectedMinPrice !== undefined || selectedMaxPrice !== undefined ? 1 : 0)}
                            </span>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 pb-6">
                        <FilterContent />
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    // Show full card layout for desktop only
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
                <FilterContent />
            </CardContent>
        </Card>
    );
}
