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
        <div className={`flex items-center border rounded-lg p-1 ${isMobile ? 'w-full' : ''}`}>
            <Button
                variant={currentView === 'grid' ? 'default' : 'ghost'}
                size={isMobile ? 'default' : 'sm'}
                onClick={() => handleViewChange('grid')}
                className={`${isMobile ? 'flex-1' : 'px-3'} flex items-center justify-center`}
                type="button"
            >
                <Grid3X3 className="w-4 h-4" />
                {isMobile && <span className="ml-2">Grid</span>}
            </Button>
            <Button
                variant={currentView === 'list' ? 'default' : 'ghost'}
                size={isMobile ? 'default' : 'sm'}
                onClick={() => handleViewChange('list')}
                className={`${isMobile ? 'flex-1' : 'px-3'} flex items-center justify-center`}
                type="button"
            >
                <List className="w-4 h-4" />
                {isMobile && <span className="ml-2">List</span>}
            </Button>
        </div>
    );
}
