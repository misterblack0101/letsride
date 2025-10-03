"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchComponentProps {
    isMobile?: boolean;
}

/**
 * HeaderSearch - responsive search with an expandable mobile experience and always-visible desktop bar.
 */
export default function HeaderSearch({ isMobile = false }: SearchComponentProps) {
    const [searchValue, setSearchValue] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Collapse/clear when navigating away from search
    useEffect(() => {
        if (pathname && !pathname.startsWith('/search')) {
            setSearchValue('');
            setIsExpanded(false);
        }
    }, [pathname]);

    const handleSearch = () => {
        if (searchValue.trim()) {
            const searchUrl = `/search?q=${encodeURIComponent(searchValue.trim())}`;
            router.push(searchUrl);
            setIsExpanded(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        if (isMobile) setIsExpanded(false);
    };

    const toggleExpanded = () => {
        setIsExpanded((s) => !s);
        if (!isExpanded) {
            setTimeout(() => {
                const input = document.querySelector('input[placeholder="Search products..."]') as HTMLInputElement | null;
                if (input) input.focus();
            }, 80);
        }
    };

    if (isMobile) {
        return (
            <div className="relative">
                {!isExpanded ? (
                    <button
                        onClick={toggleExpanded}
                        className="p-1.5 bg-white border border-border rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50"
                        aria-label="Open search"
                    >
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </button>
                ) : (
                    <>
                        {/* Backdrop to dim content and close on tap */}
                        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setIsExpanded(false)} />
                        <div className="fixed inset-x-3 top-6 z-50">
                            <div className="flex items-center bg-white border border-border rounded-2xl shadow-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary px-3 py-2">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="flex-1 px-3 py-2 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground rounded-md"
                                    style={{ fontSize: '16px' }}
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck={false}
                                />
                                <button onClick={clearSearch} className="p-2 text-muted-foreground hover:text-destructive transition-colors" aria-label="Clear search">
                                    <X className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={handleSearch}
                                    disabled={!searchValue.trim()}
                                    className="p-2 ml-1 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Submit search"
                                >
                                    <Search className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </>
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
                    spellCheck={false}
                />
                {searchValue && (
                    <button onClick={clearSearch} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                )}
                <button
                    onClick={handleSearch}
                    disabled={!searchValue.trim()}
                    className="p-2.5 m-1 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:cursor-not-allowed"
                >
                    <Search className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}