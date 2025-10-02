
import React from 'react';
import { fetchCategorizedRecommendedProducts, fetchHomepageHeroData } from '@/lib/server/products.server';
import HeroBanner from '@/components/homepage/HeroBanner';
import HorizontalProductSection from '@/components/homepage/HorizontalProductSection';
import FindYourRideCTA from '@/components/homepage/FindYourRideCTA';
import NewsletterSignup from '@/components/homepage/NewsletterSignup';

/**
 * Homepage component with server-side rendering of recommended products.
 * 
 * **Architecture:**
 * - Server component for optimal performance and SEO
 * - Fetches categorized recommended products from Firestore
 * - Renders horizontal product sections with conditional display
 * - Uses modular components for maintainable UI structure
 * 
 * **Data Flow:**
 * - Server-side data fetching via fetchCategorizedRecommendedProducts
 * - Passes product data to client components for interactivity
 * - Sections only render if products are available
 * 
 * **Performance:**
 * - Static data fetching for faster initial load
 * - Horizontal scrolling implemented client-side for smooth UX
 * - Optimized images with Next.js Image component
 */
const HomePage = async () => {
  // Fetch categorized recommended products and hero data server-side
  const [categorizedProducts, heroData] = await Promise.all([
    fetchCategorizedRecommendedProducts(),
    fetchHomepageHeroData()
  ]);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner */}
      <HeroBanner
        heroTitle={heroData.heroTitle}
        heroSubtitle={heroData.heroSubtitle}
        heroImageUrl={heroData.heroImageUrl}
      />

      {/* Top Bikes Section */}
      <HorizontalProductSection
        title="Top Bikes"
        products={categorizedProducts.topBikes}
        viewAllLink="/products/bikes"
        showShopAll={true}
      />

      {/* Best of Apparel Section */}
      <HorizontalProductSection
        title="Best of Apparel"
        products={categorizedProducts.bestOfApparel}
        viewAllLink="/products/apparel"
        showShopAll={true}
      />

      {/* Popular Accessories Section */}
      <HorizontalProductSection
        title="Popular Accessories"
        products={categorizedProducts.popularAccessories}
        viewAllLink="/products/accessories"
        showShopAll={true}
      />

      {/* Find Your Perfect Ride CTA */}
      <FindYourRideCTA />

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  );
};

export default HomePage;
