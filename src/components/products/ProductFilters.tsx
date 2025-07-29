import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

type ProductFiltersProps = {
  filters: {
    type: string[];
    brand: string[];
    price: [number, number];
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  availableBrands: string[];
  availableTypes: string[];
};

export default function ProductFilters({ filters, setFilters, availableBrands, availableTypes }: ProductFiltersProps) {
  const isMobile = useIsMobile();
  const [sliderValue, setSliderValue] = useState<[number, number]>(filters.price);

  const handleTypeChange = (type: string) => {
    setFilters((prev: any) => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter((t: string) => t !== type)
        : [...prev.type, type],
    }));
  };

  const handleBrandChange = (brand: string) => {
    setFilters((prev: any) => ({
      ...prev,
      brand: prev.brand.includes(brand)
        ? prev.brand.filter((b: string) => b !== brand)
        : [...prev.brand, brand],
    }));
  };

  // Update local slider value on drag
  const handleSliderChange = (value: number[]) => {
    setSliderValue([Math.max(0, value[0]), Math.min(120000, value[1])]);
  };

  // Only update filters when drag ends
  const handleSliderCommit = (value: number[]) => {
    let [min, max] = value;
    min = Math.max(0, Math.min(min, 120000));
    max = Math.max(0, Math.min(max, 120000));
    if (min > max) min = max;
    if (max < min) max = min;
    setFilters((prev: any) => ({ ...prev, price: [min, max] }));
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow any input while typing, validate on blur
    setFilters((prev: any) => ({
      ...prev,
      price: [value === '' ? 0 : Math.max(0, parseInt(value) || 0), prev.price[1]]
    }));
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow any input while typing, validate on blur
    setFilters((prev: any) => ({
      ...prev,
      price: [prev.price[0], value === '' ? 120000 : Math.max(0, parseInt(value) || 120000)]
    }));
  };

  const handleMinPriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const validMin = Math.max(0, Math.min(value, filters.price[1]));
    setFilters((prev: any) => ({ ...prev, price: [validMin, prev.price[1]] }));
  };

  const handleMaxPriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 120000;
    const validMax = Math.max(filters.price[0], Math.min(value, 120000));
    setFilters((prev: any) => ({ ...prev, price: [prev.price[0], validMax] }));
  };

  const clearFilters = () => {
    setFilters({
      type: [],
      brand: [],
      price: [0, 120000],
    });
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">
          Clear All
        </Button>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Type</h4>
        <div className="space-y-3">
          {availableTypes.map(type => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={filters.type.includes(type)}
                onCheckedChange={() => handleTypeChange(type)}
              />
              <Label htmlFor={`type-${type}`} className="cursor-pointer text-sm">{type}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-3">Brand</h4>
        <div className="space-y-3">
          {availableBrands.map(brand => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={filters.brand.includes(brand)}
                onCheckedChange={() => handleBrandChange(brand)}
              />
              <Label htmlFor={`brand-${brand}`} className="cursor-pointer text-sm">{brand}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-headline font-semibold mb-3">Price Range (₹)</h4>
        <div className="space-y-4">
          <div className="px-2">
            <Slider
              min={0}
              max={120000}
              step={1000}
              value={sliderValue}
              onValueChange={handleSliderChange}
              onValueCommit={handleSliderCommit}
              className="w-full max-w-full sm:max-w-[400px] mx-auto"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-headline">₹{sliderValue[0].toLocaleString('en-IN')}</span>
            <span className="font-headline">₹{sliderValue[1].toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  React.useEffect(() => {
    setSliderValue(filters.price);
  }, [filters.price]);

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full mb-4">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filter Products</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardContent className="p-6">
        <FilterContent />
      </CardContent>
    </Card>
  );
}
