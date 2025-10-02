'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Grid3X3, List } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

type ServerViewToggleProps = {
    currentView: 'grid' | 'list';
};

export default function ServerViewToggle({ currentView }: ServerViewToggleProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isMobile = useIsMobile();

    const handleViewChange = (mode: 'grid' | 'list') => {
        const params = new URLSearchParams(searchParams);

        if (mode === 'grid') {
            params.delete('view');
        } else {
            params.set('view', mode);
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-100 h-10">
            <Button
                variant={currentView === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('grid')}
                className="px-2 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700"
                style={{
                    backgroundColor: currentView === 'grid' ? 'hsl(197, 78%, 52%)' : '#f3f4f6',
                    color: currentView === 'grid' ? '#ffffff' : '#374151'
                }}
                type="button"
            >
                <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
                variant={currentView === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('list')}
                className="px-2 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700"
                style={{
                    backgroundColor: currentView === 'list' ? 'hsl(197, 78%, 52%)' : '#f3f4f6',
                    color: currentView === 'list' ? '#ffffff' : '#374151'
                }}
                type="button"
            >
                <List className="w-4 h-4" />
            </Button>
        </div>
    );
}
