import { NextRequest, NextResponse } from 'next/server';
import { getCategoriesFromDB } from '@/lib/services/categories';

/**
 * Public API endpoint for category, subcategory, and brand data.
 * 
 * **Security:**
 * - No authentication required (public data)
 * - Server-side only using Firebase Admin SDK
 * 
 * **Data Source:**
 * - Fetches from Firestore categories collection
 * - Uses React cache for request-level deduplication
 * - Pre-computed lookups for efficient UI rendering
 * 
 * **Operations:**
 * - GET: Fetch complete category structure with brands
 */

/**
 * GET: Fetch complete category, subcategory, and brand data
 * 
 * **Response Format:**
 * ```json
 * {
 *   "categories": {
 *     "Bikes": {
 *       "subcategories": {
 *         "Mountain": { "brands": ["Trek", "Giant"] },
 *         "Road": { "brands": ["Specialized", "Cannondale"] }
 *       }
 *     }
 *   },
 *   "subcategoriesByCategory": {
 *     "Bikes": ["Mountain", "Road"],
 *     "Accessories": ["Bags", "Lights"]
 *   },
 *   "brandsBySubcategory": {
 *     "Bikes": {
 *       "Mountain": ["Trek", "Giant"],
 *       "Road": ["Specialized", "Cannondale"]
 *     }
 *   },
 *   "allBrands": ["Cannondale", "Giant", "Specialized", "Trek"],
 *   "brandsByCategory": {
 *     "Bikes": ["Cannondale", "Giant", "Specialized", "Trek"],
 *     "Accessories": ["Bell", "Giro", "Topeak"]
 *   }
 * }
 * ```
 */
export async function GET(req: NextRequest) {
    try {
        const categoryData = await getCategoriesFromDB();

        return NextResponse.json({
            success: true,
            data: categoryData
        });

    } catch (error) {
        console.error('Error fetching category data:', error);
        return NextResponse.json({
            error: 'Failed to fetch category data'
        }, { status: 500 });
    }
}