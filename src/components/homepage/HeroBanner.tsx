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
        <div className="relative w-full max-w-full rounded-2xl overflow-hidden shadow-lg bg-gray-900">
            {/* Background Image with natural aspect ratio */}
            <div className="relative">
                <Image
                    src={heroImageUrl}
                    alt="Hero Banner"
                    width={1200}
                    height={500}
                    className="w-full h-auto object-cover"
                    priority
                />
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4 sm:px-6 py-8 sm:py-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight">
                        {heroTitle}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
                        {heroSubtitle}
                    </p>
                    <Link
                        href="/products"
                        className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm md:text-base"
                    >
                        Shop Now
                    </Link>
                </div>
            </div>
        </div>
    );
}