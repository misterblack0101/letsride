import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    hasNextPage,
    hasPreviousPage
}: PaginationProps) {
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

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center mt-8">
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(currentPage - 1)}
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
                            onClick={() => onPageChange(1)}
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
                        onClick={() => onPageChange(page)}
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
                            onClick={() => onPageChange(totalPages)}
                        >
                            {totalPages}
                        </Button>
                    </>
                )}

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    aria-label="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}