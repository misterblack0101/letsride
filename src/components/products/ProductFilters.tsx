import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

type ProductFiltersProps = {
  filters: {
    brand: string[];
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  availableBrands: string[];
  // Add support for contextual filtering
  category?: string;
  subcategory?: string;
};

function ProductFilters({
  filters,
  setFilters,
  availableBrands,
  category,
  subcategory
}: ProductFiltersProps) {
  const isMobile = useIsMobile();

  const handleBrandChange = (brand: string) => {
    setFilters((prev: any) => ({
      ...prev,
      brand: prev.brand.includes(brand)
        ? prev.brand.filter((b: string) => b !== brand)
        : [...prev.brand, brand],
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: [],
      brand: [],
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

      {/* Type filter removed by request */}

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

      {/* Price Range Filter removed */}
    </div>
  );

  // Price range effect removed

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

// Export with React.memo to prevent unnecessary re-renders when props don't change
export default React.memo(ProductFilters, (prevProps, nextProps) => {
  // Return true if the props are equal (component will not re-render)
  return (
    // Compare basic props
    prevProps.category === nextProps.category &&
    prevProps.subcategory === nextProps.subcategory &&

    // Deep compare arrays (brands)
    JSON.stringify(prevProps.availableBrands) === JSON.stringify(nextProps.availableBrands) &&

    // Compare brand filters array length
    prevProps.filters.brand.length === nextProps.filters.brand.length &&

    // Compare brand filters content (assuming they're sorted)
    JSON.stringify(prevProps.filters.brand) === JSON.stringify(nextProps.filters.brand)
  );
});
