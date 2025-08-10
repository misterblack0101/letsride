"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/models/Product';

interface SearchComponentProps {
    isOpen: boolean;
    onToggle: () => void;
    isMobile?: boolean;
}

interface SearchResult {
    products: Product[];
}

interface SuggestionsResult {
    suggestions: string[];
}

interface SearchRef {
    timeout?: NodeJS.Timeout;
    abortController?: AbortController;
}

export default function HeaderSearch({ isOpen, onToggle, isMobile = false }: SearchComponentProps) {
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<SearchRef>({});
    const resultsRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Debounced search with immediate clearing
    useEffect(() => {
        // Clear existing results immediately when query changes
        setSearchResults([]);
        setSuggestions([]);
        setShowResults(false);

        // Cancel any pending requests
        if (searchRef.current.timeout) {
            clearTimeout(searchRef.current.timeout);
        }
        if (searchRef.current.abortController) {
            searchRef.current.abortController.abort();
        }

        const trimmedQuery = searchValue.trim();

        if (trimmedQuery.length >= 2) {
            setIsLoading(true);

            // Create new AbortController for request cancellation
            const abortController = new AbortController();
            searchRef.current.abortController = abortController;

            searchRef.current.timeout = setTimeout(async () => {
                try {
                    // Fetch both products and suggestions with abort signal
                    const [productsRes, suggestionsRes] = await Promise.all([
                        fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}&limit=5`, {
                            signal: abortController.signal
                        }),
                        fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}&type=suggestions`, {
                            signal: abortController.signal
                        })
                    ]);

                    // Check if request was aborted
                    if (abortController.signal.aborted) return;

                    if (productsRes.ok && suggestionsRes.ok) {
                        const productsData: SearchResult = await productsRes.json();
                        const suggestionsData: SuggestionsResult = await suggestionsRes.json();

                        // Only update results if the query hasn't changed
                        if (searchValue.trim() === trimmedQuery) {
                            setSearchResults(productsData.products);
                            setSuggestions(suggestionsData.suggestions);
                            setShowResults(true);
                        }
                    }
                } catch (error) {
                    // Ignore AbortError
                    if (error instanceof Error && error.name !== 'AbortError') {
                        console.error('Search error:', error);
                        setSearchResults([]);
                        setSuggestions([]);
                    }
                } finally {
                    setIsLoading(false);
                }
            }, 300);
        } else {
            setIsLoading(false);
        }

        return () => {
            if (searchRef.current.timeout) {
                clearTimeout(searchRef.current.timeout);
            }
            if (searchRef.current.abortController) {
                searchRef.current.abortController.abort();
            }
        };
    }, [searchValue]);    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = () => {
        if (searchValue.trim()) {
            // Cancel any pending search requests
            if (searchRef.current.timeout) {
                clearTimeout(searchRef.current.timeout);
            }
            if (searchRef.current.abortController) {
                searchRef.current.abortController.abort();
            }
            setIsLoading(false);

            // Navigate immediately
            const searchUrl = `/search?q=${encodeURIComponent(searchValue.trim())}`;
            router.push(searchUrl);

            // Delay the toggle to allow navigation to complete
            setTimeout(() => {
                onToggle();
                setShowResults(false);
            }, 100);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission delay
            handleSearch();
        }
        if (e.key === 'Escape') {
            onToggle();
            setShowResults(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setSearchValue(suggestion);
        setShowResults(false);
    };

    const handlePopularSearchClick = (term: string) => {
        setSearchValue(term);
        // Don't close the search interface, let user see the filled text
        // Focus the input field after setting the value
        setTimeout(() => {
            const input = document.querySelector('input[placeholder="Search products..."]') as HTMLInputElement;
            if (input) {
                input.focus();
                // Place cursor at the end of the text
                input.setSelectionRange(term.length, term.length);
            }
        }, 0);
    };

    const handleProductClick = () => {
        onToggle();
        setShowResults(false);
    };

    const clearSearch = () => {
        if (searchValue.trim()) {
            // If there's text, just clear it
            setSearchValue('');
            setSearchResults([]);
            setSuggestions([]);
            setShowResults(false);
            // Focus back to the input after clearing
            setTimeout(() => {
                const input = document.querySelector('input[placeholder="Search products..."]') as HTMLInputElement;
                if (input) input.focus();
            }, 0);
        } else {
            // If no text, close the search bar
            onToggle();
        }
    };

    if (isMobile) {
        return (
            <>
                {/* Mobile Search Trigger */}
                <button
                    onClick={onToggle}
                    className="btn btn-ghost btn-circle hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                    <Search className="h-5 w-5" />
                </button>

                {/* Mobile Search Popup */}
                {isOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={onToggle}
                        />

                        {/* Search Panel */}
                        <div className="absolute top-0 left-0 right-0 bg-base-100 shadow-lg border-b border-base-200 p-4 animate-in slide-in-from-top duration-300">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 relative" ref={resultsRef}>
                                    <div className="form-control">
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                placeholder="Search products..."
                                                className="input input-bordered input-sm flex-1 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                                style={{ fontSize: '16px' }} // Prevent zoom on iOS
                                                value={searchValue}
                                                onChange={(e) => setSearchValue(e.target.value)}
                                                onKeyDown={handleKeyPress}
                                                onFocus={() => setShowResults(searchValue.length >= 2)}
                                                onTouchStart={(e) => e.stopPropagation()} // Prevent touch interference
                                                autoFocus
                                                autoComplete="off"
                                                autoCorrect="off"
                                                autoCapitalize="off"
                                                spellCheck="false"
                                            />
                                            <button
                                                onClick={clearSearch}
                                                className="btn btn-ghost btn-square btn-sm hover:bg-error/10 hover:text-error transition-all duration-200"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={handleSearch}
                                                disabled={!searchValue.trim()}
                                                className="btn btn-square btn-sm btn-primary hover:btn-primary-focus transition-all duration-200 disabled:opacity-50"
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Search className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mobile Search Results */}
                                    {showResults && (searchResults.length > 0 || suggestions.length > 0) && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-base-100 border border-base-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                                            {/* Suggestions */}
                                            {suggestions.length > 0 && (
                                                <div className="p-2 border-b border-base-200">
                                                    <p className="text-xs font-medium text-base-content/60 mb-2">Suggestions</p>
                                                    {suggestions.map((suggestion, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleSuggestionClick(suggestion)}
                                                            className="block w-full text-left p-2 hover:bg-base-200 rounded text-sm"
                                                        >
                                                            {suggestion}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Products */}
                                            {searchResults.length > 0 && (
                                                <div className="p-2">
                                                    <p className="text-xs font-medium text-base-content/60 mb-2">Products</p>
                                                    {searchResults.map((product) => (
                                                        <Link
                                                            key={product.id}
                                                            href={`/product/${product.id}`}
                                                            onClick={handleProductClick}
                                                            className="flex items-center gap-3 p-2 hover:bg-base-200 rounded"
                                                        >
                                                            <Image
                                                                src={product.images?.[0] || '/images/placeholder.jpg'}
                                                                alt={product.name}
                                                                width={40}
                                                                height={40}
                                                                className="rounded object-cover"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">{product.name}</p>
                                                                <p className="text-xs text-base-content/60">{product.brand}</p>
                                                                <p className="text-sm font-bold text-primary font-currency">
                                                                    ₹{product.discountedPrice.toLocaleString('en-IN')}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    ))}

                                                    {/* View all results link */}
                                                    <Link
                                                        href={`/search?q=${encodeURIComponent(searchValue)}`}
                                                        onClick={handleProductClick}
                                                        className="block w-full text-center p-2 mt-2 text-sm text-primary hover:bg-primary/10 rounded"
                                                    >
                                                        View all results for &ldquo;{searchValue}&rdquo;
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick suggestions */}
                            <div className="mt-4">
                                <p className="text-sm text-base-content/60 mb-2">Popular searches:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Mountain Bike', 'Helmet', 'Accessories', 'Gear'].map((term) => (
                                        <button
                                            key={term}
                                            className="btn btn-ghost btn-sm normal-case hover:bg-primary/10 hover:text-primary"
                                            onClick={() => handlePopularSearchClick(term)}
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Desktop Search
    return (
        <div className="flex items-center relative" ref={resultsRef}>
            {!isOpen ? (
                <button
                    onClick={onToggle}
                    className="btn btn-ghost btn-circle hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                    <Search className="h-5 w-5" />
                </button>
            ) : (
                <div className="flex items-center gap-2 animate-in slide-in-from-left duration-300">
                    <div className="form-control relative">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="input input-bordered input-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                onFocus={() => setShowResults(searchValue.length >= 2)}
                                autoFocus
                            />
                            <button
                                onClick={clearSearch}
                                className="btn btn-ghost btn-square btn-sm hover:bg-error/10 hover:text-error transition-all duration-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleSearch}
                                disabled={!searchValue.trim()}
                                className="btn btn-square btn-sm btn-primary hover:btn-primary-focus transition-all duration-200 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        {/* Desktop Search Results */}
                        {showResults && (searchResults.length > 0 || suggestions.length > 0) && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-base-100 border border-base-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50 w-96">
                                {/* Suggestions */}
                                {suggestions.length > 0 && (
                                    <div className="p-3 border-b border-base-200">
                                        <p className="text-xs font-medium text-base-content/60 mb-2">Suggestions</p>
                                        {suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="block w-full text-left p-2 hover:bg-base-200 rounded text-sm"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Products */}
                                {searchResults.length > 0 && (
                                    <div className="p-3">
                                        <p className="text-xs font-medium text-base-content/60 mb-2">Products</p>
                                        {searchResults.map((product) => (
                                            <Link
                                                key={product.id}
                                                href={`/product/${product.id}`}
                                                onClick={handleProductClick}
                                                className="flex items-center gap-3 p-2 hover:bg-base-200 rounded"
                                            >
                                                <Image
                                                    src={product.images?.[0] || '/images/placeholder.jpg'}
                                                    alt={product.name}
                                                    width={48}
                                                    height={48}
                                                    className="rounded object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{product.name}</p>
                                                    <p className="text-sm text-base-content/60">{product.brand}</p>
                                                    <p className="text-sm font-bold text-primary font-currency">
                                                        ₹{product.discountedPrice.toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}

                                        {/* View all results link */}
                                        <Link
                                            href={`/search?q=${encodeURIComponent(searchValue)}`}
                                            onClick={handleProductClick}
                                            className="block w-full text-center p-2 mt-2 text-sm text-primary hover:bg-primary/10 rounded"
                                        >
                                            View all results for &ldquo;{searchValue}&rdquo;
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
