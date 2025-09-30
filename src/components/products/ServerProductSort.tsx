'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

type ServerProductSortProps = {
    currentSort: string;
};

export default function ServerProductSort({ currentSort }: ServerProductSortProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('sort', value);

        // Reset pagination when sort changes
        params.delete('page');
        params.delete('lastId');

        router.push(`${pathname}?${params.toString()}`);
    };

    const getSortLabel = (sort: string) => {
        switch (sort) {
            case 'name':
                return 'Name (A-Z)';
            case 'price_low':
                return 'Price: Low to High';
            case 'price_high':
                return 'Price: High to Low';
            case 'rating':
            default:
                return 'Rating';
        }
    };

    return (
        <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className={isMobile ? "w-full" : "w-full sm:w-[200px]"}>
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
        </Select>
    );
}
