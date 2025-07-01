import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { brands, types } from '@/lib/data';

type ProductFiltersProps = {
  filters: {
    type: string[];
    brand: string[];
    price: [number, number];
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
};

export default function ProductFilters({ filters, setFilters }: ProductFiltersProps) {
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

  const handlePriceChange = (value: [number, number]) => {
    setFilters((prev: any) => ({ ...prev, price: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Type</h3>
          <div className="space-y-3">
            {types.map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={filters.type.includes(type)}
                  onCheckedChange={() => handleTypeChange(type)}
                />
                <Label htmlFor={`type-${type}`} className="cursor-pointer">{type}</Label>
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="font-semibold mb-3">Brand</h3>
          <div className="space-y-3">
            {brands.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brand.includes(brand)}
                  onCheckedChange={() => handleBrandChange(brand)}
                />
                <Label htmlFor={`brand-${brand}`} className="cursor-pointer">{brand}</Label>
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="font-semibold mb-3">Price Range</h3>
          <Slider
            min={0}
            max={120000}
            step={5000}
            value={filters.price}
            onValueChange={handlePriceChange}
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>₹{filters.price[0].toLocaleString('en-IN')}</span>
            <span>₹{filters.price[1].toLocaleString('en-IN')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
