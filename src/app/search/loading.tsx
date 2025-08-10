import { Loader2 } from 'lucide-react';
import { LottieLoading } from '@/components/ui/loading';

export default function SearchLoading() {
    return (
        <div className="min-h-screen bg-[#fffdf9]">
            {/* Lottie Loading Animation at the top */}
            <div className="flex items-center justify-center pt-16">
                <LottieLoading size="md" fullscreen={false} />
            </div>
            <div className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-base-content/60">Searching products...</p>
                </div>
            </div>
        </div>
    );
}
