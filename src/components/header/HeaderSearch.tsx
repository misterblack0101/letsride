"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchComponentProps {
    isMobile?: boolean;
}

/**
 * HeaderSearch component providing responsive search functionality with different UX patterns for mobile and desktop.
 * 
 * **Mobile Experience:**
 * - Collapsed state: Circular search icon button to save header space
 * - Expanded state: Full-width overlay search bar with fixed positioning
 * - Auto-focus: Input field automatically focused when expanded
 * - Auto-collapse: Closes after search completion or when navigating away
 * - Single action close: X button clears text and closes expanded search
 * - Keyboard shortcuts: Enter to search, Escape to close
 * 
 * **Desktop Experience:**
 * - Always visible: Full search bar permanently displayed in header
 * - Circular design: Pill-shaped container with rounded edges
 * - Inline actions: Clear and search buttons integrated within the input
 * 
 * **Shared Features:**
 * - Route-aware clearing: Search field clears when navigating away from search pages
 * - Circular styling: Fully rounded borders (rounded-full) for modern appearance
 * - Smooth transitions: All state changes animated for better UX
 * - Search navigation: Routes to /search page with query parameters
 * - Input validation: Prevents empty searches
 * 
 * **Architecture:**
 * - No real-time search API calls during typing (cost-effective)
 * - Submit-only search behavior (Enter key or search button click)
 * - Client-side state management with React hooks
 * - Next.js router integration for navigation
 * - Responsive design with conditional rendering based on screen size
 * 
 * **Mobile State Management:**
 * - `isExpanded`: Controls collapsed/expanded state
 * - `searchValue`: Input text content
 * - Auto-collapse triggers: Search completion, navigation, manual close
 * 
 * @param isMobile - Whether to render mobile-optimized expandable version or desktop always-visible version
 * 
 * @example
 * ```tsx
 * // Desktop usage (always visible)
 * <HeaderSearch isMobile={false} />
 * 
 * // Mobile usage (expandable icon button)
 * <HeaderSearch isMobile={true} />
 * ```
 */
export default function HeaderSearch({ isMobile = false }: SearchComponentProps) {
    const [searchValue, setSearchValue] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Clear search field when navigating away from search page
    useEffect(() => {
        if (pathname && !pathname.startsWith('/search')) {
            setSearchValue('');
            setIsExpanded(false); // Also collapse on navigation
        }
    }, [pathname]);

    const handleSearch = () => {
        if (searchValue.trim()) {
            const searchUrl = `/search?q=${encodeURIComponent(searchValue.trim())}`;
            router.push(searchUrl);
            setIsExpanded(false); // Collapse after search on mobile
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
        if (e.key === 'Escape') {
            setIsExpanded(false);
            setSearchValue('');
        }
    };

    const clearSearch = () => {
        setSearchValue('');
        if (isMobile) {
            setIsExpanded(false); // Close the expanded search on mobile
        }
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
        // Focus input when expanding
        if (!isExpanded) {
            setTimeout(() => {
                const input = document.querySelector('input[placeholder="Search products..."]') as HTMLInputElement;
                if (input) input.focus();
            }, 100);
        }
    };

    if (isMobile) {
        return (
            <div className="relative">
                {/* Mobile Search - Icon Button that expands */}
                {!isExpanded ? (
                    // Collapsed state - just the search icon
                    <button
                        onClick={toggleExpanded}
                        className="p-2 bg-white border border-border rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50"
                    >
                        <Search className="h-5 w-5 text-muted-foreground" />
                    </button>
                ) : (
                    // Expanded state - full search input
                    <div className="fixed inset-x-4 top-4 z-50">
                        <div className="flex items-center bg-white border border-border rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="flex-1 px-4 py-3 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground rounded-full"
                                style={{ fontSize: '16px' }} // Prevent zoom on iOS
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                            />
                            <button
                                onClick={clearSearch}
                                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleSearch}
                                disabled={!searchValue.trim()}
                                className="p-2 m-1 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Desktop Search - Always Visible
    return (
        <div className="relative w-80">
            <div className="flex items-center bg-white border border-border rounded-full shadow-sm hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                <input
                    type="text"
                    placeholder="Search products..."
                    className="flex-1 px-4 py-2.5 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground rounded-full"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                />
                {searchValue && (
                    <button
                        onClick={clearSearch}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
                <button
                    onClick={handleSearch}
                    disabled={!searchValue.trim()}
                    className="p-2.5 m-1 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Search className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}