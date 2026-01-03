import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className = '' }: PaginationProps) {
    // Logic to show limited page numbers (e.g. 1, 2, ..., 5, 6, 7, ..., 10)
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // simplified for now

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first, last, and window around current
            if (currentPage <= 3) {
                // Near start: 1, 2, 3, 4, ..., 10
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('ellipsis');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near end: 1, ..., 7, 8, 9, 10
                pages.push(1);
                pages.push('ellipsis');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                // Middle: 1, ..., 4, 5, 6, ..., 10
                pages.push(1);
                pages.push('ellipsis');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className={`flex items-center justify-center gap-2 ${className}`}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-full w-9 h-9 text-gray-400 hover:text-culina-green hover:bg-culina-green/5 disabled:opacity-30"
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1.5 bg-gray-50/50 p-1 rounded-full border border-gray-100/50">
                {getPageNumbers().map((page, i) => (
                    page === 'ellipsis' ? (
                        <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400">
                            <MoreHorizontal className="w-4 h-4" />
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => typeof page === 'number' && onPageChange(page)}
                            className={`
                                w-8 h-8 rounded-full text-sm font-semibold transition-all duration-200
                                ${currentPage === page
                                    ? 'bg-culina-green text-white shadow-md shadow-emerald-500/20 scale-105'
                                    : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-culina-green'
                                }
                            `}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-full w-9 h-9 text-gray-400 hover:text-culina-green hover:bg-culina-green/5 disabled:opacity-30"
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
