import Link from 'next/link';

/**
 * Call-to-action section for finding the perfect ride.
 * 
 * **Design Features:**
 * - Dark background with centered content
 * - Matches the "Find Your Perfect Ride" section from reference
 * - Clean typography and prominent button
 * 
 * **Usage:**
 * ```tsx
 * <FindYourRideCTA />
 * ```
 */
export default function FindYourRideCTA() {
    return (
        <section className="relative w-full max-w-full overflow-hidden rounded-2xl shadow-lg bg-gray-900">
            {/* Background with gradient overlay */}
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center text-white px-4 sm:px-6 py-8 sm:py-12 md:py-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl  font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                        Find Your Perfect Ride
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
                        Whether you're a weekend warrior or daily commuter, we have the perfect bike just
                        for your cycling journey.
                    </p>

                    <Link
                        href="/products"
                        className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base md:text-lg"
                    >
                        Explore Collection
                    </Link>
                </div>
            </div>
        </section>
    );
}