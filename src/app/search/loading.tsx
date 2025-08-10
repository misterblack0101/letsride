import { Loader2 } from 'lucide-react';

export default function SearchLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header skeleton */}
            <div className="mb-6">
                <div className="w-32 h-6 bg-base-200 animate-pulse rounded"></div>
            </div>

            <div className="mb-8">
                <div className="w-80 h-8 bg-base-200 animate-pulse rounded mb-2"></div>
                <div className="w-48 h-5 bg-base-200 animate-pulse rounded"></div>
            </div>

            {/* Loading spinner */}
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-base-content/60">Searching products...</p>
                </div>
            </div>
        </div>
    );
}
