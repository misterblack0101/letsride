"use client";

import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchComponentProps {
    isOpen: boolean;
    onToggle: () => void;
    isMobile?: boolean;
}

export default function HeaderSearch({ isOpen, onToggle, isMobile = false }: SearchComponentProps) {
    const [searchValue, setSearchValue] = useState('');

    const handleSearch = () => {
        // TODO: Implement search functionality
        console.log('Searching for:', searchValue);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
        if (e.key === 'Escape') {
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
                                <div className="flex-1">
                                    <div className="form-control">
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                placeholder="Search products..."
                                                className="input input-bordered input-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                                value={searchValue}
                                                onChange={(e) => setSearchValue(e.target.value)}
                                                onKeyDown={handleKeyPress}
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSearch}
                                                className="btn btn-square btn-sm btn-primary hover:btn-primary-focus transition-all duration-200"
                                            >
                                                <Search className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={onToggle}
                                    className="btn btn-ghost btn-circle btn-sm hover:bg-error/10 hover:text-error transition-all duration-200"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Quick suggestions */}
                            <div className="mt-4">
                                <p className="text-sm text-base-content/60 mb-2">Popular searches:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Mountain Bike', 'Helmet', 'Accessories', 'Gear'].map((term) => (
                                        <button
                                            key={term}
                                            className="btn btn-ghost btn-sm normal-case hover:bg-primary/10 hover:text-primary"
                                            onClick={() => setSearchValue(term)}
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
        <div className="flex items-center">
            {!isOpen ? (
                <button
                    onClick={onToggle}
                    className="btn btn-ghost btn-circle hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                    <Search className="h-5 w-5" />
                </button>
            ) : (
                <div className="flex items-center gap-2 animate-in slide-in-from-left duration-300">
                    <div className="form-control">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="input input-bordered input-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                autoFocus
                            />
                            <button
                                onClick={handleSearch}
                                className="btn btn-square btn-sm btn-primary hover:btn-primary-focus transition-all duration-200"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={onToggle}
                        className="btn btn-ghost btn-circle btn-sm hover:bg-error/10 hover:text-error transition-all duration-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
