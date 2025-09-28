'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

type ServerProductFiltersProps = {
    availableBrands: string[];
    availableCategories: string[];
    selectedCategories: string[];
    selectedBrands: string[];
    priceRange: [number, number];
    // New props for contextual filtering
    currentCategory?: string;
    currentSubcategory?: string;
    currentSubcategories?: string[];
};

export default function ServerProductFilters({
    availableBrands,
    availableCategories,
    selectedCategories,
    selectedBrands,
    priceRange,
    currentCategory,
    currentSubcategory,
    currentSubcategories
}: ServerProductFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();

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
    };

    const handleCategoryChange = (category: string, checked: boolean) => {
        const newCategories = checked
            ? [...selectedCategories, category]
            : selectedCategories.filter(c => c !== category);

        updateURL({ category: newCategories });
    };

    const handleBrandChange = (brand: string, checked: boolean) => {
        const newBrands = checked
            ? [...selectedBrands, brand]
            : selectedBrands.filter(b => b !== brand);

        updateURL({ brand: newBrands });
    };

    const handlePriceChange = (newPrice: [number, number]) => {
        updateURL({
            minPrice: newPrice[0].toString(),
            maxPrice: newPrice[1].toString()
        });
    };

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
    };

    const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 ||
        priceRange[0] > 0 || priceRange[1] < 120000;

    const FilterContent = () => (
        <div className="space-y-6">
            {/* Clear all filters */}
            {hasActiveFilters && (
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Filters</span>
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

            {/* Context information - show what category/subcategory we're in */}
            {currentCategory && (
                <div>
                    <h3 className="font-medium mb-1">Currently Browsing</h3>
                    <div className="text-sm bg-muted/50 p-2 rounded">
                        <div><strong>Category:</strong> {currentCategory}</div>
                        {currentSubcategory && (
                            <div><strong>Subcategory:</strong> {currentSubcategory}</div>
                        )}
                    </div>
                </div>
            )}

            {/* Category Filter - only show if not in a category context */}
            {!currentCategory && availableCategories.length > 0 && (
                <>
                    <div>
                        <h3 className="font-medium mb-3">Category</h3>
                        <div className="space-y-2">
                            {availableCategories.map(category => (
                                <div key={category} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`category-${category}`}
                                        checked={selectedCategories.includes(category)}
                                        onCheckedChange={(checked) =>
                                            handleCategoryChange(category, checked as boolean)
                                        }
                                    />
                                    <Label
                                        htmlFor={`category-${category}`}
                                        className="text-sm capitalize cursor-pointer"
                                    >
                                        {category}
                                    </Label>
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
                        <h3 className="font-medium mb-3">Subcategories</h3>
                        <div className="space-y-2">
                            {currentSubcategories.map(subcat => (
                                <div key={subcat} className="flex items-center space-x-2">
                                    <a
                                        href={`/products/${encodeURIComponent(currentCategory)}/${encodeURIComponent(subcat)}`}
                                        className="text-sm hover:underline hover:text-primary cursor-pointer w-full py-1"
                                    >
                                        {subcat}
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
                <h3 className="font-medium mb-3">Brand</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableBrands.map(brand => (
                        <div key={brand} className="flex items-center space-x-2">
                            <Checkbox
                                id={`brand-${brand}`}
                                checked={selectedBrands.includes(brand)}
                                onCheckedChange={(checked) =>
                                    handleBrandChange(brand, checked as boolean)
                                }
                            />
                            <Label
                                htmlFor={`brand-${brand}`}
                                className="text-sm cursor-pointer"
                            >
                                {brand}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Price Range Filter */}
            <div>
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="space-y-4">
                    <Slider
                        value={priceRange}
                        onValueChange={handlePriceChange}
                        max={120000}
                        min={0}
                        step={1000}
                        className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>₹{priceRange[0].toLocaleString()}</span>
                        <span>₹{priceRange[1].toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                        {hasActiveFilters && (
                            <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                {selectedCategories.length + selectedBrands.length + (priceRange[0] > 0 || priceRange[1] < 120000 ? 1 : 0)}
                            </span>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                    <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                        <FilterContent />
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

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
