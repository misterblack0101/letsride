'use client';

import { useState } from 'react';

/**
 * Newsletter signup component for joining the cycling community.
 * 
 * **Features:**
 * - Email input with validation
 * - Client-side form handling
 * - Responsive design
 * - Matches the newsletter section from reference design
 * 
 * **Usage:**
 * ```tsx
 * <NewsletterSignup />
 * ```
 */
export default function NewsletterSignup() {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            // Here you would typically send the email to your backend
            console.log('Newsletter signup:', email);
            setIsSubscribed(true);
            setEmail('');
        }
    };

    return (
        <section className="relative w-full max-w-full overflow-hidden rounded-2xl shadow-lg bg-gray-100">
            {/* Background with subtle gradient */}
            <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
                <div className="text-center px-4 sm:px-6 py-8 sm:py-10 md:py-12">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                        Join the Cycling Community
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 max-w-lg mx-auto leading-relaxed">
                        Get exclusive deals, cycling tips and be the first to know about new arrivals.
                    </p>

                    {isSubscribed ? (
                        <div className="bg-green-100 border border-green-300 text-green-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg max-w-md mx-auto text-sm sm:text-base">
                            Thank you for subscribing! Check your email for confirmation.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
                                required
                            />
                            <button
                                type="submit"
                                className="bg-gray-900 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-gray-800 transition-colors duration-300 font-semibold text-sm sm:text-base whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}