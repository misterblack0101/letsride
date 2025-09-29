'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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

    // Change page handler
    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-col items-center mt-8 space-y-4">
            <div className="text-sm text-muted-foreground">
                Showing {Math.min(pageSize * (currentPage - 1) + 1, totalItems)} to {Math.min(pageSize * currentPage, totalItems)} of {totalItems} results
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPreviousPage}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* First page */}
                {getPageNumbers()[0] > 1 && (
                    <>
                        <Button
                            variant={currentPage === 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(1)}
                        >
                            1
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
                        onClick={() => handlePageChange(page)}
                    >
                        {page}
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
                            onClick={() => handlePageChange(totalPages)}
                        >
                            {totalPages}
                        </Button>
                    </>
                )}

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    aria-label="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}