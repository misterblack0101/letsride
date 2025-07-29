import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

type ProductSortProps = {
  sort: string;
  setSort: (value: string) => void;
};

export default function ProductSort({ sort, setSort }: ProductSortProps) {
  const isMobile = useIsMobile();

  return (
    <Select value={sort} onValueChange={setSort}>
      <SelectTrigger className={isMobile ? "w-full" : "w-full sm:w-[200px]"}>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="popularity">Sort by Popularity</SelectItem>
        <SelectItem value="rating">Sort by Average Rating</SelectItem>
        <SelectItem value="price-asc">Sort by Price: Low to High</SelectItem>
        <SelectItem value="price-desc">Sort by Price: High to Low</SelectItem>
      </SelectContent>
    </Select>
  );
}
