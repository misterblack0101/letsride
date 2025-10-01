'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Check, X, Loader2 } from 'lucide-react';

interface PriceRangeFilterProps {
    minPrice?: number;
    maxPrice?: number;
    onPriceChange: (minPrice: number | undefined, maxPrice: number | undefined) => void;
    disabled?: boolean;
}

const MIN_PRICE = 0;
const MAX_PRICE = 1000000;
const STEP = 1000;

export default function PriceRangeFilter({
    minPrice,
    maxPrice,
    onPriceChange,
    disabled = false
}: PriceRangeFilterProps) {
    // Transition state for loading
    const [isPending, startTransition] = useTransition();

    // Local state for immediate UI updates
    const [localMinPrice, setLocalMinPrice] = useState<string>(minPrice?.toString() || '');
    const [localMaxPrice, setLocalMaxPrice] = useState<string>(maxPrice?.toString() || '');

    // Slider value state
    const [sliderValue, setSliderValue] = useState<[number, number]>([
        minPrice || MIN_PRICE,
        maxPrice || MAX_PRICE
    ]);    // Update local state when props change
    useEffect(() => {
        setLocalMinPrice(minPrice?.toString() || '');
        setLocalMaxPrice(maxPrice?.toString() || '');
        setSliderValue([minPrice || MIN_PRICE, maxPrice || MAX_PRICE]);
    }, [minPrice, maxPrice]);

    const handleSliderChange = useCallback((values: number[]) => {
        const [min, max] = values;
        setSliderValue([min, max]);
        setLocalMinPrice(min.toString());
        setLocalMaxPrice(max.toString());
    }, []);

    const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only allow numbers and empty string
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= MAX_PRICE)) {
            setLocalMinPrice(value);
        }
    };

    const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only allow numbers and empty string
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= MAX_PRICE)) {
            setLocalMaxPrice(value);
        }
    };

    const applyTextInputs = () => {
        const minVal = localMinPrice === '' ? MIN_PRICE : Math.max(MIN_PRICE, parseInt(localMinPrice) || MIN_PRICE);
        const maxVal = localMaxPrice === '' ? MAX_PRICE : Math.min(MAX_PRICE, parseInt(localMaxPrice) || MAX_PRICE);

        // Ensure min is not greater than max
        const validMin = minVal && maxVal && minVal > maxVal ? maxVal : minVal;
        const validMax = maxVal && validMin && maxVal < validMin ? validMin : maxVal;

        // Update local display values to show the validated numbers
        setLocalMinPrice(validMin.toString());
        setLocalMaxPrice(validMax.toString());
        setSliderValue([validMin, validMax]);
    };

    const applyPriceFilter = () => {
        if (isPending) return; // Prevent multiple concurrent requests

        const minVal = localMinPrice === '' ? undefined : Math.max(MIN_PRICE, parseInt(localMinPrice) || MIN_PRICE);
        const maxVal = localMaxPrice === '' ? undefined : Math.min(MAX_PRICE, parseInt(localMaxPrice) || MAX_PRICE);

        // Ensure min is not greater than max
        const validMin = minVal && maxVal && minVal > maxVal ? maxVal : minVal;
        const validMax = maxVal && validMin && maxVal < validMin ? validMin : maxVal;

        // Update local display values to show the validated numbers
        if (validMin !== undefined) setLocalMinPrice(validMin.toString());
        if (validMax !== undefined) setLocalMaxPrice(validMax.toString());

        setSliderValue([validMin || MIN_PRICE, validMax || MAX_PRICE]);

        // Dispatch event to trigger loading state in ProductGrid (same pattern as pagination)
        window.dispatchEvent(new CustomEvent('priceFilterStart'));

        // Use React's startTransition to mark this as a non-urgent update
        startTransition(() => {
            onPriceChange(
                validMin === MIN_PRICE ? undefined : validMin,
                validMax === MAX_PRICE ? undefined : validMax
            );
        });
    }; const clearFilters = () => {
        setLocalMinPrice('');
        setLocalMaxPrice('');
        setSliderValue([MIN_PRICE, MAX_PRICE]);
        onPriceChange(undefined, undefined);
    };

    const formatPrice = (price: number) => {
        return `₹${price.toLocaleString('en-IN')}`;
    };

    // Calculate font size based on input length to prevent cropping
    const getInputFontSize = (value: string) => {
        const length = value.length;
        if (length <= 3) return 'text-sm'; // Default size for short numbers
        if (length <= 5) return 'text-xs'; // Smaller for 4-5 digits
        if (length <= 7) return 'text-[11px]'; // Readable size for 6-7 digits
        return 'text-[10px]'; // Extra small for 8+ digits (shouldn't happen with our max)
    };

    const hasActiveFilter = sliderValue[0] > MIN_PRICE || sliderValue[1] < MAX_PRICE;
    const hasChanges = (parseInt(localMinPrice) || MIN_PRICE) !== sliderValue[0] ||
        (parseInt(localMaxPrice) || MAX_PRICE) !== sliderValue[1] ||
        sliderValue[0] !== (minPrice || MIN_PRICE) ||
        sliderValue[1] !== (maxPrice || MAX_PRICE);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-bold">Price Range</Label>
                {hasActiveFilter && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                        disabled={disabled}
                    >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Range Slider */}
            <div className="px-2">
                <Slider
                    value={sliderValue}
                    onValueChange={handleSliderChange}
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step={STEP}
                    className="w-full"
                    disabled={disabled}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1 font-currency">
                    <span>{formatPrice(MIN_PRICE)}</span>
                    <span>{formatPrice(MAX_PRICE)}</span>
                </div>
            </div>

            {/* Min/Max Input Fields */}
            <div className="space-y-3">
                <div className="space-y-1">
                    <Label htmlFor="min-price" className="text-xs text-muted-foreground">
                        Min Price
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-currency">
                            ₹
                        </span>
                        <Input
                            id="min-price"
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={localMinPrice}
                            onChange={handleMinPriceChange}
                            onBlur={applyTextInputs}
                            onKeyDown={(e) => e.key === 'Enter' && applyTextInputs()}
                            placeholder="0"
                            min={MIN_PRICE}
                            max={MAX_PRICE}
                            step={STEP}
                            className={`pl-7 pr-2 ${getInputFontSize(localMinPrice)} font-mono leading-tight w-full`}
                            disabled={disabled}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="max-price" className="text-xs text-muted-foreground">
                        Max Price
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-currency">
                            ₹
                        </span>
                        <Input
                            id="max-price"
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={localMaxPrice}
                            onChange={handleMaxPriceChange}
                            onBlur={applyTextInputs}
                            onKeyDown={(e) => e.key === 'Enter' && applyTextInputs()}
                            placeholder="1000000"
                            min={MIN_PRICE}
                            max={MAX_PRICE}
                            step={STEP}
                            className={`pl-7 pr-2 ${getInputFontSize(localMaxPrice)} font-mono leading-tight w-full`}
                            disabled={disabled}
                        />
                    </div>
                </div>
            </div>

            {/* Go Button - Amazon Style */}
            <div className="flex justify-center">
                <Button
                    onClick={applyPriceFilter}
                    disabled={disabled || !hasChanges || isPending}
                    variant="outline"
                    size="sm"
                    className="px-6"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                        </>
                    ) : (
                        'Go'
                    )}
                </Button>
            </div>

            {/* Current Range Display */}
            {hasActiveFilter && (
                <div className="text-xs text-muted-foreground text-center font-currency">
                    {formatPrice(sliderValue[0])} - {formatPrice(sliderValue[1])}
                </div>
            )}
        </div>
    );
}