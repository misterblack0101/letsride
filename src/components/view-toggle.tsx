import { Button } from '@/components/ui/button';
import { Grid3X3, List } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

type ViewToggleProps = {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
};

export default function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  const isMobile = useIsMobile();

  const handleGridClick = () => {
    onViewModeChange('grid');
  };

  const handleListClick = () => {
    onViewModeChange('list');
  };

  return (
    <div className={`flex items-center border rounded-lg p-1 ${isMobile ? 'w-full' : ''}`}>
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size={isMobile ? 'default' : 'sm'}
        onClick={handleGridClick}
        className={`${isMobile ? 'flex-1' : 'px-3'} flex items-center justify-center`}
        type="button"
      >
        <Grid3X3 className="w-4 h-4" />
        <span className={`ml-1 ${isMobile ? 'inline' : 'hidden sm:inline'}`}>Grid</span>
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size={isMobile ? 'default' : 'sm'}
        onClick={handleListClick}
        className={`${isMobile ? 'flex-1' : 'px-3'} flex items-center justify-center`}
        type="button"
      >
        <List className="w-4 h-4" />
        <span className={`ml-1 ${isMobile ? 'inline' : 'hidden sm:inline'}`}>List</span>
      </Button>
    </div>
  );
}
