import { NextResponse } from 'next/server';
import { fetchCategorizedRecommendedProducts } from '@/lib/server/products.server';

/**
 * GET /api/products/recommended
 * 
 * Fetches recommended products categorized by type for homepage display.
 * Returns products where isRecommended=true, grouped by category.
 * 
 * **Response Structure:**
 * ```typescript
 * {
 *   topBikes: Product[],      // Bikes category
 *   bestOfApparel: Product[], // Apparel category  
 *   popularAccessories: Product[] // Accessories category
 * }
 * ```
 * 
 * **Caching Strategy:**
 * - 5 minutes public cache with 10 minutes stale-while-revalidate
 * - Appropriate for homepage content that doesn't change frequently
 * 
 * @returns {Object} Categorized recommended products
 */
export async function GET() {
  try {
    const categorizedProducts = await fetchCategorizedRecommendedProducts();

    return NextResponse.json(categorizedProducts, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommended products' },
      { status: 500 }
    );
  }
}
