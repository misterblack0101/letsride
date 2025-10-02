'use client';

import { useTransition } from 'react';
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
    const [isPending, startTransition] = useTransition();

    const handleSortChange = (value: string) => {
        // Dispatch filter change event for ProductGrid
        window.dispatchEvent(new CustomEvent('filterChangeStart'));

        // Use transition for smooth navigation and loading state
        startTransition(() => {
            const params = new URLSearchParams(searchParams);
            params.set('sort', value);

            // Reset pagination when sort changes
            params.delete('page');
            params.delete('lastId');

            router.push(`${pathname}?${params.toString()}`);
        });
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
        <Select value={currentSort} onValueChange={handleSortChange} disabled={isPending}>
            <SelectTrigger
                className={`w-full ${isMobile ? 'h-10' : 'h-9'} border-gray-200 ${isPending ? 'opacity-50' : ''}`}
                style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    transition: 'background-color 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => !isPending && (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                onMouseLeave={(e) => !isPending && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            >
                {isPending ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Sorting...</span>
                    </div>
                ) : (
                    <SelectValue placeholder="Sort by" />
                )}
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
