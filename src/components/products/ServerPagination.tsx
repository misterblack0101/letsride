'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

/**
 * Server-side pagination component with hybrid cursor/offset pagination strategy.
 * 
 * **Pagination Strategy Decision Logic:**
 * This component automatically determines which pagination strategy to use based on user navigation:
 * 
 * 1. **Cursor-based pagination** (efficient):
 *    - Sequential next navigation: page 1 → 2, page 2 → 3
 *    - Arrow "next" button clicks
 *    - Includes `lastId` parameter in URL for server-side cursor positioning
 *    - Example URL: `/products?page=2&lastId=product_24_id`
 * 
 * 2. **Offset-based pagination** (fallback):
 *    - Page number jumps: page 1 → 5, page 3 → 1
 *    - Arrow "previous" button clicks  
 *    - Direct URL access without valid `lastId`
 *    - Removes `lastId` parameter to trigger offset-based server logic
 *    - Example URL: `/products?page=5`
 * 
 * **Navigation Flow Examples:**
 * ```
 * User on Page 1 clicks "Page 2":
 * ├─ isSequentialNext = true (2 === 1 + 1)
 * ├─ lastProductId exists
 * └─ URL: /products?page=2&lastId=xyz (cursor-based)
 * 
 * User on Page 1 clicks "Page 5":
 * ├─ isSequentialNext = false (5 !== 1 + 1)  
 * └─ URL: /products?page=5 (offset-based)
 * 
 * User on Page 3 clicks "Previous":
 * ├─ direction = 'prev'
 * └─ URL: /products?page=2 (offset-based)
 * ```
 * 
 * **Performance Benefits:**
 * - 90% of navigation is sequential → uses efficient cursor pagination
 * - Edge cases (jumps, backward) → uses reliable offset pagination
 * - Immediate URL updates for better perceived performance
 * - Server components re-render with correct data
 * 
 * @param props - Pagination configuration and state
 */
interface ServerPaginationProps {
    /** Current page number (1-based) */
    currentPage: number;
    /** Total number of pages available */
    totalPages: number;
    /** Total number of items across all pages */
    totalItems: number;
    /** Number of items per page */
    pageSize: number;
    /** ID of the last product on current page (for cursor-based pagination) */
    lastProductId?: string;
}

export default function ServerPagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    lastProductId
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

        // **HYBRID PAGINATION STRATEGY SELECTION**
        // Determine whether to use cursor-based or offset-based pagination
        // based on the type of navigation the user is performing

        // Check if this is a sequential "next" navigation (most common case)
        const isSequentialNext = page === currentPage + 1;

        if (isSequentialNext && lastProductId) {
            // ✅ CURSOR-BASED: Sequential next navigation with available cursor
            // This is the most efficient path - Firestore only processes documents after the cursor
            // Example: Page 1 → Page 2 with lastId="product_24_id"
            params.set('lastId', lastProductId);
        } else {
            // ⚠️ OFFSET-BASED: Page jumps, backward navigation, or missing cursor
            // Less efficient but handles all edge cases reliably
            // Examples: 
            // - Page 1 → Page 5 (jump)
            // - Page 3 → Page 1 (backward) 
            // - Direct URL access without lastId
            params.delete('lastId');
        }

        const newUrl = `${pathname}?${params.toString()}`;

        // Update URL immediately for better UX
        window.history.pushState(null, '', newUrl);

        // Use React's startTransition to mark this as a non-urgent update
        startTransition(() => {
            router.push(newUrl);
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

        // **ARROW NAVIGATION OPTIMIZATION**
        // Arrow navigation follows predictable patterns, enabling cursor-based optimization

        if (direction === 'next' && lastProductId) {
            // ✅ CURSOR-BASED: Forward arrow with available cursor (optimal path)
            // Firestore can skip directly to the next batch using startAfter(lastProductId)
            // Example: Page 2 → Page 3 with cursor "product_48_id"
            params.set('lastId', lastProductId);
        } else {
            // ⚠️ OFFSET-BASED: Backward arrow or missing cursor
            // Backward navigation always requires offset since Firestore doesn't support "startBefore"
            // Missing cursor scenarios handled gracefully with offset calculation
            // Examples: Page 3 → Page 2 (backward), Page 1 → Page 2 (missing cursor)
            params.delete('lastId');
        }

        const newUrl = `${pathname}?${params.toString()}`;

        // Update URL immediately for better UX
        window.history.pushState(null, '', newUrl);

        startTransition(() => {
            router.push(newUrl);
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