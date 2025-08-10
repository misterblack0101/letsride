'use client';

import { useRouter, useSearchParams } from 'next/navigation';
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
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams);

        if (value === 'popularity') {
            params.delete('sort');
        } else {
            params.set('sort', value);
        }

        router.push(`/products?${params.toString()}`);
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
                return 'Rating';
            case 'popularity':
            default:
                return 'Popularity';
        }
    };

    return (
        <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className={isMobile ? "w-full" : "w-full sm:w-[200px]"}>
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
        </Select>
    );
}
