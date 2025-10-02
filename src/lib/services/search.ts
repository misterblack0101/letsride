import { algoliasearch } from 'algoliasearch';
import { Product } from '../models/Product';

/**
 * Algolia search implementation for professional e-commerce search.
 * 
 * **Search Strategy:**
 * - Uses Algolia's powerful search engine for instant, typo-tolerant search
 * - Searches across: name, brand, category, subCategory, shortDescription
 * - Includes advanced features: faceting, filtering, ranking, analytics
 * - Cost-efficient: Algolia free tier (10k records, 100k operations/month)
 * 
 * **Features:**
 * 1. Typo tolerance - handles misspellings automatically
 * 2. Instant search - sub-20ms response times
 * 3. Faceted search - filter by category, brand, price, etc.
 * 4. Search highlighting - highlights matching terms
 * 5. Advanced ranking - relevance-based results
 * 
 * **Search Fields:**
 * - name: Product name (highest priority)
 * - brand: Product brand
 * - category: Main category
 * - subCategory: Subcategory
 * - shortDescription: Product description
 * 
 * @param query - Search term to find matching products
 * @param limit - Maximum number of results to return per page
 * @param filters - Optional filters (e.g., ['category:Bikes', 'brand:Trek'])
 * @param page - Page number for pagination (0-based)
 * 
 * @returns Promise resolving to array of matching products
 * 
 * @throws Handles all errors internally, returns empty array on failure
 * 
 * @example
 * ```typescript
 * // Search across all searchable fields
 * const results = await searchProducts('mountain bike', 10);
 * 
 * // Search with pagination
 * const page2Results = await searchProducts('bike', 24, undefined, 1);
 * 
 * // Search with filters
 * const trekBikes = await searchProducts('bike', 20, ['brand:Trek']);
 * ```
 */

// Initialize Algolia client
const client = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
    process.env.ALGOLIA_SEARCH_API_KEY!
);
/**
 * Main search function using Algolia
 */
export async function searchProducts(
    query: string,
    limit: number = 10,
    filters?: string[],
    page: number = 0
): Promise<Product[]> {
    if (!query || query.trim().length < 2) {
        return [];
    }

    try {
        const searchResults = await client.searchSingleIndex({
            indexName: 'search_index',
            searchParams: {
                query: query.trim(),
                hitsPerPage: limit,
                page: page,
                attributesToRetrieve: ['*'],
                typoTolerance: true,
                filters: filters?.join(' AND '),
                facets: ['category', 'subCategory', 'brand'],
                attributesToHighlight: ['name', 'brand', 'shortDescription'],
                highlightPreTag: '<mark>',
                highlightPostTag: '</mark>'
            }
        });

        // Map hits to Product type, preserving objectID as id
        return searchResults.hits.map(hit => {
            const mappedHit = {
                ...hit,
                id: hit.objectID
            };

            if ((hit as any).image && !(hit as any).images) {
                (mappedHit as any).images = [(hit as any).image];
                // Remove the single image field since Product model expects images array
                // delete (mappedHit as any).image;
            }

            return mappedHit;
        }) as unknown as Product[];
    } catch (error) {
        console.error('Algolia search error:', error);
        return [];
    }
}

/**
 * Get search suggestions for autocomplete
 */
// export async function getSearchSuggestions(query: string): Promise<string[]> {
//     if (!query || query.trim().length < 2) {
//         return [];
//     }

//     try {
//         const searchResults = await client.searchSingleIndex({
//             indexName: 'products',
//             searchParams: {
//                 query: query.trim(),
//                 hitsPerPage: 5,
//                 attributesToRetrieve: ['name'],
//                 typoTolerance: true
//             }
//         });

//         return searchResults.hits
//             .map(hit => (hit as any).name)
//             .filter(Boolean)
//             .filter((name, index, arr) => arr.indexOf(name) === index); // Remove duplicates
//     } catch (error) {
//         console.error('Algolia suggestions error:', error);
//         return [];
//     }
// }

/**
 * Get faceted search results for filtering
 */
// export async function getSearchFacets(query: string = '*'): Promise<{
//     categories: Array<{ value: string; count: number }>;
//     brands: Array<{ value: string; count: number }>;
// }> {
//     try {
//         const searchResults = await client.searchSingleIndex({
//             indexName: 'products',
//             searchParams: {
//                 query,
//                 hitsPerPage: 0, // We only want facets, not results
//                 facets: ['category', 'brand']
//             }
//         });

//         const facets = searchResults.facets || {};

//         return {
//             categories: Object.entries(facets.category || {}).map(([value, count]) => ({
//                 value,
//                 count: count as number
//             })),
//             brands: Object.entries(facets.brand || {}).map(([value, count]) => ({
//                 value,
//                 count: count as number
//             }))
//         };
//     } catch (error) {
//         console.error('Algolia facets error:', error);
//         return { categories: [], brands: [] };
//     }
// }
// 