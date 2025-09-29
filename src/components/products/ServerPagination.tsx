'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

interface ServerPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
}

export default function ServerPagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize
}: ServerPaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [navigatingTo, setNavigatingTo] = useState<number | null>(null);

    // Determine if next/previous pages exist
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        // Always show 5 pages if possible
        if (endPage - startPage < 4) {
            if (startPage === 1) {
                endPage = Math.min(5, totalPages);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, totalPages - 4);
            }
        }

        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    // Track separate navigation states for page numbers and prev/next buttons
    const [arrowNavigating, setArrowNavigating] = useState<'prev' | 'next' | null>(null);

    // Change page handler for number buttons
    const handlePageChange = (page: number) => {
        // Don't do anything if we're already navigating
        if (isPending) return;

        // Reset navigatingTo if clicking the currently navigating page again
        if (navigatingTo === page) {
            return;
        }

        // Prevent the default behavior just in case
        setTimeout(() => {
            const element = document.activeElement as HTMLElement;
            if (element && typeof element.blur === 'function') {
                element.blur();
            }
        }, 10);

        // Force immediate scroll to top (no smooth animation to ensure it happens instantly)
        try {
            // Try scrolling the main content area if it exists
            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.scrollTop = 0;
            }

            // Also scroll the window to be safe
            window.scrollTo(0, 0);
        } catch (e) {
            // Fallback if any errors
            window.scrollTo(0, 0);
        }

        // Reset arrow navigation state
        setArrowNavigating(null);

        // Set which pagen we're navigating to for the loading indicator
        setNavigatingTo(page);

        // Dispatch an event that ProductGrid listens for
        window.dispatchEvent(new CustomEvent('paginationStart'));

        // Create the new URL with updated page parameter
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());

        // Use React's startTransition to mark this as a non-urgent update
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    // Handle prev/next arrow navigation separately
    const handleArrowNavigation = (direction: 'prev' | 'next') => {
        if (isPending) return;

        // Prevent the default behavior just in case
        setTimeout(() => {
            const element = document.activeElement as HTMLElement;
            if (element && typeof element.blur === 'function') {
                element.blur();
            }
        }, 10);

        // Force immediate scroll to top (no smooth animation to ensure it happens instantly)
        try {
            // Try scrolling the main content area if it exists
            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.scrollTop = 0;
            }

            // Also scroll the window to be safe
            window.scrollTo(0, 0);
        } catch (e) {
            // Fallback if any errors
            window.scrollTo(0, 0);
        }

        // Calculate the target page
        const targetPage = direction === 'prev' ? currentPage - 1 : currentPage + 1;

        // Set arrow navigation state
        setArrowNavigating(direction);
        setNavigatingTo(null);

        // Dispatch the pagination event
        window.dispatchEvent(new CustomEvent('paginationStart'));

        // Update URL
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', targetPage.toString());

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    }; if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center mt-10">
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-md border-gray-300"
                    onClick={() => handleArrowNavigation('prev')}
                    disabled={!hasPreviousPage || (isPending && arrowNavigating === 'prev')}
                    aria-label="Previous page"
                >
                    {isPending && arrowNavigating === 'prev' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>

                {/* First page */}
                {getPageNumbers()[0] > 1 && (
                    <>
                        <Button
                            variant={currentPage === 1 ? "default" : "outline"}
                            size="sm"
                            className="h-9 w-9 rounded-md"
                            onClick={() => handlePageChange(1)}
                            disabled={isPending && navigatingTo === 1}
                        >
                            {navigatingTo === 1 && isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                1
                            )}
                        </Button>
                        {getPageNumbers()[0] > 2 && (
                            <span className="mx-1 text-muted-foreground">...</span>
                        )}
                    </>
                )}

                {/* Page numbers */}
                {getPageNumbers().map(page => (
                    <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className="h-9 w-9 rounded-md"
                        onClick={() => handlePageChange(page)}
                        disabled={isPending && navigatingTo === page}
                    >
                        {navigatingTo === page && isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            page
                        )}
                    </Button>
                ))}

                {/* Last page */}
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                    <>
                        {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                            <span className="mx-1 text-muted-foreground">...</span>
                        )}
                        <Button
                            variant={currentPage === totalPages ? "default" : "outline"}
                            size="sm"
                            className="h-9 w-9 rounded-md"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={isPending && navigatingTo === totalPages}
                        >
                            {navigatingTo === totalPages && isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                totalPages
                            )}
                        </Button>
                    </>
                )}

                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-md border-gray-300"
                    onClick={() => handleArrowNavigation('next')}
                    disabled={!hasNextPage || (isPending && arrowNavigating === 'next')}
                    aria-label="Next page"
                >
                    {isPending && arrowNavigating === 'next' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    );
}