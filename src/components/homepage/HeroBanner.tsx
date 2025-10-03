import Image from 'next/image';
import Link from 'next/link';

interface HeroBannerProps {
    heroTitle: string;
    heroSubtitle: string;
    heroImageUrl: string;
}

/**
 * Hero banner component for homepage with dynamic content from Firestore.
 * 
 * **Design Features:**
 * - Full-width banner with responsive background image
 * - Overlay text with call-to-action button
 * - Dynamic content fetched from Firestore /miscellaneous/homePage
 * 
 * **Data Source:**
 * - heroTitle: Main headline text
 * - heroSubtitle: Descriptive text below title
 * - heroImageUrl: Background image URL
 * 
 * @param heroTitle - Main banner headline
 * @param heroSubtitle - Supporting description text
 * @param heroImageUrl - Background image URL
 * 
 * @example
 * ```tsx
 * <HeroBanner
 *   heroTitle="Summer Sale: Up To 40% Off"
 *   heroSubtitle="Discover premium bikes..."
 *   heroImageUrl="/images/hero_lg.png"
 * />
 * ```
 */
export default function HeroBanner({ heroTitle, heroSubtitle, heroImageUrl }: HeroBannerProps) {
    return (
        <Link href="/products" className="block group cursor-pointer">
            <div className="relative w-full max-w-full rounded-2xl overflow-hidden shadow-lg bg-gray-900 group-hover:shadow-xl transition-shadow duration-300">
                {/* Mobile: auto aspect ratio, Desktop: fixed half-height */}
                <div className="relative w-full lg:h-56 xl:h-64">
                    <div className="block lg:hidden">
                        <Image
                            src={heroImageUrl}
                            alt="Hero Banner"
                            width={1200}
                            height={500}
                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                            priority
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                    </div>
                    <div className="hidden lg:block h-full w-full">
                        <Image
                            src={heroImageUrl}
                            alt="Hero Banner"
                            fill
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            priority
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                    </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-4 sm:px-6 py-8 sm:py-12">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight group-hover:scale-105 transition-transform duration-300">
                            {heroTitle}
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
                            {heroSubtitle}
                        </p>
                        <div className="inline-block bg-red-600 group-hover:bg-red-700 text-white font-semibold px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg transition-colors duration-300 shadow-lg group-hover:shadow-xl text-xs sm:text-sm md:text-base group-hover:scale-105 transform">
                            Shop Now
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}