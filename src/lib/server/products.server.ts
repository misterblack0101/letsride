import { adminDb as db, getDatabase } from '../firebase/admin';
import { CollectionReference } from 'firebase-admin/firestore';
import { ProductSchema, Product } from '../models/Product';
import { retryOperation } from './retry';
import { cache } from 'react';

// Runtime guard: fail fast if this file is imported in a browser/client environment.
if (typeof window !== 'undefined') {
    throw new Error('server/products.server.ts is server-only and must not be imported from client-side code');
}

/**
 * Filter and pagination options for product queries optimized for infinite scroll.
 * Uses cursor-based pagination exclusively to minimize Firestore read costs.
 * 
 * **Infinite Scroll Strategy:**
 * This system uses cursor-based pagination only, eliminating expensive offset queries:
 * 
 * 1. **Initial load**: No `startAfterId` provided
 * 2. **Subsequent loads**: Uses `startAfterId` from previous batch's last product
 * 3. **Cost optimization**: Each query only reads required documents (no skipping)
 * 
 * @interface ProductFilterOptions
 */
export interface ProductFilterOptions {
    /** Array of category names to filter by. Uses Firestore 'in' operator for multiple values. */
    categories?: string[];
    /** Array of brand names to filter by. Uses Firestore 'in' operator for multiple values. */
    brands?: string[];
    /** Minimum price filter (inclusive). Combined with maxPrice for range queries. */
    minPrice?: number;
    /** Maximum price filter (inclusive). Combined with minPrice for range queries. */
    maxPrice?: number;
    /** Sort order for results. Affects Firestore index requirements when combined with filters. */
    sortBy?: 'name' | 'price_low' | 'price_high' | 'rating';
    /** Number of products to return per page. Default: 20. */
    pageSize?: number;
    /** 
     * Document ID to start after for cursor-based pagination. 
     * Should be the ID of the last document from the previous page.
     * Enables cost-efficient infinite scroll by using Firestore's startAfter().
     */
    startAfterId?: string;
}

/**
 * Response format for infinite scroll product queries.
 * Provides products and metadata needed for infinite scroll UI.
 */
export interface InfiniteScrollResponse {
    /** Products in current batch */
    products: Product[];
    /** Whether more products are available for loading */
    hasMore: boolean;
    /** ID of last product in batch (for next cursor pagination) */
    lastProductId?: string;
}

import { createQueryBuilder } from './firestore-query-builder';

/**
 * Fetches filtered products with infinite scroll optimization.
 * 
 * **Cost Optimization Strategy:**
 * - Uses cursor-based pagination exclusively (no offset queries)
 * - Each query reads only required documents via Firestore's startAfter()
 * - Returns metadata needed for infinite scroll UI (hasMore, lastProductId)
 * - Eliminates expensive skip operations that scale linearly with page number
 * 
 * **Implementation Details:**
 * - Fetches exactly pageSize documents to determine availability efficiently
 * - Returns products with hasMore metadata based on result count
 * - Cursor (startAfterId) enables O(1) pagination regardless of position
 * - If result count < pageSize, no more documents exist
 * 
 * **Error Handling:**
 * - Invalid `startAfterId` falls back to first page
 * - Malformed documents are logged and filtered out
 * - Query builder handles Firestore index requirements automatically
 * 
 * @param filters - Filter and pagination options
 * @returns Promise resolving to infinite scroll response with products and metadata
 * 
 * @example
 * ```typescript
 * // Initial load
 * const initial = await fetchFilteredProducts({
 *   brands: ['Trek', 'Giant'],
 *   sortBy: 'price_low',
 *   pageSize: 20
 * });
 * 
 * // Load more
 * const nextBatch = await fetchFilteredProducts({
 *   brands: ['Trek', 'Giant'],
 *   sortBy: 'price_low', 
 *   pageSize: 20,
 *   startAfterId: initial.lastProductId
 * });
 * ```
 */
export async function fetchFilteredProducts(filters: ProductFilterOptions = {}): Promise<InfiniteScrollResponse> {
    return retryOperation(async () => {
        const productsCollection = db.collection('products') as CollectionReference;

        // Initialize the query builder
        const queryBuilder = createQueryBuilder<Product>(productsCollection);

        // Apply category filter
        if (filters.categories && filters.categories.length > 0) {
            // If we have more than one category, we need to use in operator
            // Note: This requires a composite index to be created in Firestore
            if (filters.categories.length === 1) {
                queryBuilder.where('category', '==', filters.categories[0]);
            } else {
                queryBuilder.where('category', 'in', filters.categories);
            }
        }

        // Apply brand filter
        if (filters.brands && filters.brands.length > 0) {
            // If we have more than one brand, we need to use in operator
            // Note: This requires a composite index to be created in Firestore
            if (filters.brands.length === 1) {
                queryBuilder.where('brand', '==', filters.brands[0]);
            } else {
                queryBuilder.where('brand', 'in', filters.brands);
            }
        }

        // Apply price range filters
        if (filters.minPrice !== undefined) {
            queryBuilder.where('price', '>=', filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
            queryBuilder.where('price', '<=', filters.maxPrice);
        }

        // Apply sorting
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'name':
                    queryBuilder.orderBy('name', 'asc');
                    break;
                case 'price_low':
                    queryBuilder.orderBy('price', 'asc');
                    break;
                case 'price_high':
                    queryBuilder.orderBy('price', 'desc');
                    break;
                case 'rating':
                default:
                    queryBuilder.orderBy('rating', 'desc');
                    break;
            }
        } else {
            // Default sorting
            queryBuilder.orderBy('rating', 'desc');
        }

        // Apply cursor-based pagination
        if (filters.startAfterId) {
            try {
                const startDoc = await db.collection('products').doc(filters.startAfterId).get();
                if (startDoc.exists) {
                    queryBuilder.startAfter(startDoc);
                }
            } catch (err) {
                console.warn('startAfterId not found or error fetching start doc:', err);
            }
        }

        // Fetch exact pageSize documents
        const pageSize = filters.pageSize && Number.isFinite(filters.pageSize) ? filters.pageSize : 20;
        queryBuilder.limit(pageSize);

        // Execute the query
        const query = queryBuilder.build();
        const productDocs = await query.get();

        // Map and validate documents
        const products = productDocs.docs.map((doc: any) => {
            const raw = { ...doc.data(), id: doc.id };
            const parsed = ProductSchema.safeParse(raw);
            if (!parsed.success) {
                console.warn('Invalid product skipped:', parsed.error.format());
                return null;
            }
            return parsed.data;
        }).filter(Boolean) as Product[];

        // If we got fewer products than requested, there are no more
        const hasMore = products.length === pageSize;
        const lastProductId = products.length > 0 ? products[products.length - 1].id : undefined;

        return {
            products,
            hasMore,
            lastProductId
        };
    });
}

/**
 * Fetches all products without filtering.
 * 
 * **Deprecated**: This function is kept for backward compatibility but returns only the first batch.
 * For modern infinite scroll patterns, use fetchFilteredProducts() directly.
 * 
 * @returns Promise resolving to first batch of products
 * 
 * @example
 * ```typescript
 * const firstBatch = await fetchProducts();
 * ```
 */
export async function fetchProducts(): Promise<Product[]> {
    const result = await fetchFilteredProducts();
    return result.products;
}

/**
 * Fetches a single product by its Firestore document ID.
 * 
 * @param id - The Firestore document ID of the product
 * @returns Promise resolving to the product or null if not found
 * 
 * @throws {Error} When Firebase Admin SDK encounters connection issues
 * 
 * @example
 * ```typescript
 * const product = await getProductById('product-123');
 * if (product) {
 *   console.log(`Found: ${product.name}`);
 * } else {
 *   console.log('Product not found');
 * }
 * ```
 */
export async function getProductById(id: string): Promise<Product | null> {
    return retryOperation(async () => {
        const productDocRef = db.collection('products').doc(id);
        const snapshot = await productDocRef.get();

        if (!snapshot.exists) return null;

        const raw = { ...snapshot.data(), id: snapshot.id, };
        const parsed = ProductSchema.safeParse(raw);

        if (!parsed.success) {
            console.error('Invalid product schema:', parsed.error.format());
            return null;
        }

        return parsed.data;
    });
}



/**
 * Fetches products filtered by specific category and subcategory combination.
 * 
 * This function is optimized for category/subcategory page routes and uses
 * compound WHERE clauses for efficient filtering. It supports additional
 * filters like brands, price range, and sorting.
 * 
 * **Route Usage**: Primarily used by `/products/[category]/[subcategory]` pages.
 * 
 * @param category - Product category (will be URI decoded)
 * @param subcategory - Product subcategory (will be URI decoded)
 * @param options - Additional filtering and pagination options
 * @param options.sortBy - Sort order for results
 * @param options.pageSize - Number of products to return (pagination)
 * @param options.startAfterId - Document ID for cursor-based pagination
 * @param options.brands - Array of brand names to filter by
 * @param options.minPrice - Minimum price filter (inclusive)
 * @param options.maxPrice - Maximum price filter (inclusive)
 * 
 * @returns Promise resolving to array of filtered products
 * 
 * @throws {Error} When Firestore composite indexes are missing for complex filters
 * 
 * @example
 * ```typescript
 * // Get mountain bikes from Trek brand
 * const mountainBikes = await getFilteredProductsViaCategory(
 *   'Bikes', 
 *   'Mountain',
 *   {
 *     brands: ['Trek'],
 *     sortBy: 'price_low',
 *     pageSize: 20
 *   }
 * );
 * 
 * // Get helmets in price range with pagination
 * const helmets = await getFilteredProductsViaCategory(
 *   'Safety Gear',
 *   'Helmets', 
 *   {
 *     minPrice: 50,
 *     maxPrice: 200,
 *     startAfterId: 'previous-page-last-id'
 *   }
 * );
 * ```
 */
export async function getFilteredProductsViaCategory(
    category: string,
    subcategory: string,
    options: {
        sortBy?: ProductFilterOptions['sortBy'];
        pageSize?: number;
        startAfterId?: string;
        brands?: string[];
        minPrice?: number;
        maxPrice?: number;
    } = {}
): Promise<InfiniteScrollResponse> {
    return retryOperation(async () => {
        const productsRef = db.collection('products') as CollectionReference;
        // Decode URI components to handle special characters
        category = decodeURIComponent(category);
        subcategory = decodeURIComponent(subcategory);

        // Use the query builder pattern
        const queryBuilder = createQueryBuilder<Product>(productsRef);

        // Apply category and subcategory filters
        queryBuilder
            .where('category', '==', category)
            .where('subCategory', '==', subcategory);

        // Apply brand filter if provided
        if (options.brands && options.brands.length > 0) {
            if (options.brands.length === 1) {
                queryBuilder.where('brand', '==', options.brands[0]);
            } else {
                queryBuilder.where('brand', 'in', options.brands);
            }
        }

        // Apply price range filters
        if (options.minPrice !== undefined) {
            queryBuilder.where('price', '>=', options.minPrice);
        }
        if (options.maxPrice !== undefined) {
            queryBuilder.where('price', '<=', options.maxPrice);
        }

        // Apply sorting
        if (options.sortBy) {
            switch (options.sortBy) {
                case 'name':
                    queryBuilder.orderBy('name', 'asc');
                    break;
                case 'price_low':
                    queryBuilder.orderBy('price', 'asc');
                    break;
                case 'price_high':
                    queryBuilder.orderBy('price', 'desc');
                    break;
                case 'rating':
                default:
                    queryBuilder.orderBy('rating', 'desc');
                    break;
            }
        } else {
            // Default sorting
            queryBuilder.orderBy('rating', 'desc');
        }

        // Apply pagination
        if (options.startAfterId) {
            try {
                const startDoc = await productsRef.doc(options.startAfterId).get();
                if (startDoc.exists) {
                    queryBuilder.startAfter(startDoc);
                }
            } catch (err) {
                console.warn('startAfterId not found or error fetching start doc:', err);
            }
        }

        // Fetch exact pageSize documents
        const pageSize = options.pageSize && Number.isFinite(options.pageSize) ? options.pageSize : 20;
        queryBuilder.limit(pageSize);

        // Execute the query
        const query = queryBuilder.build();
        const querySnapshot = await query.get();

        // Map and validate the results
        const products = querySnapshot.docs.map((doc: any) => {
            const raw = { ...doc.data(), id: doc.id };
            const parsed = ProductSchema.safeParse(raw);
            if (!parsed.success) {
                console.warn('Invalid product skipped:', parsed.error.format());
                return null;
            }
            return parsed.data;
        }).filter(Boolean) as Product[];

        // If we got fewer products than requested, there are no more
        const hasMore = products.length === pageSize;
        const lastProductId = products.length > 0 ? products[products.length - 1].id : undefined;

        return {
            products,
            hasMore,
            lastProductId
        };
    });
}

/**
 * Fetches products marked as recommended, sorted by rating.
 * 
 * This function retrieves products with the `isRecommended` flag set to true,
 * ordering them by rating in descending order. Used for homepage recommendations
 * and featured product sections.
 * 
 * @returns Promise resolving to array of recommended products
 * 
 * @throws {Error} When Firebase Admin SDK encounters connection issues
 * 
 * @example
 * ```typescript
 * const recommendedProducts = await fetchRecommendedProducts();
 * // Products are already sorted by rating (highest first)
 * ```
 */
export async function fetchRecommendedProducts(): Promise<Product[]> {
    return retryOperation(async () => {
        const productsCollection = db.collection('products') as CollectionReference;

        // Use the query builder pattern
        const queryBuilder = createQueryBuilder<Product>(productsCollection);

        // Get recommended products
        queryBuilder
            .where('isRecommended', '==', true)
            .orderBy('rating', 'desc');

        // Execute the query
        const query = queryBuilder.build();
        const snapshot = await query.get();

        const products = snapshot.docs.map(doc => {
            const raw = { ...doc.data(), id: doc.id };
            const parsed = ProductSchema.safeParse(raw);
            if (!parsed.success) {
                console.warn('Invalid product skipped:', parsed.error.format());
                return null;
            }
            return parsed.data;
        });

        return products.filter(Boolean) as Product[];
    });
}

/**
 * Response structure for categorized recommended products for homepage display.
 */
export interface CategorizedRecommendedProducts {
    topBikes: Product[];
    bestOfApparel: Product[];
    popularAccessories: Product[];
}

/**
 * Fetches recommended products categorized by type for homepage sections.
 * 
 * **Categorization Logic:**
 * - Top Bikes: Products with category = "Bikes"
 * - Best of Apparel: Products with category = "Apparel" 
 * - Popular Accessories: Products with category = "Accessories"
 * 
 * **Performance Optimization:**
 * - Single Firestore query for all recommended products
 * - Client-side categorization to minimize database calls
 * - Limits results per category to prevent excessive data transfer
 * 
 * **Error Handling:**
 * - Returns empty arrays for categories with no products
 * - Continues processing if individual products fail validation
 * - Implements same retry logic as fetchRecommendedProducts
 * 
 * @param {number} limitPerCategory - Maximum products per category (default: 10)
 * @returns {Promise<CategorizedRecommendedProducts>} Categorized recommended products
 * 
 * @example
 * ```typescript
 * const categorized = await fetchCategorizedRecommendedProducts();
 * if (categorized.topBikes.length > 0) {
 *   // Render Top Bikes section
 * }
 * ```
 */
export async function fetchCategorizedRecommendedProducts(
    limitPerCategory: number = 10
): Promise<CategorizedRecommendedProducts> {
    const allRecommendedProducts = await fetchRecommendedProducts();

    // Categorize products based on category field
    const topBikes = allRecommendedProducts
        .filter(product => product.category.toLowerCase() === 'bikes')
        .slice(0, limitPerCategory);

    const bestOfApparel = allRecommendedProducts
        .filter(product => product.category.toLowerCase() === 'apparel')
        .slice(0, limitPerCategory);

    const popularAccessories = allRecommendedProducts
        .filter(product => product.category.toLowerCase() === 'accessories')
        .slice(0, limitPerCategory);

    return {
        topBikes,
        bestOfApparel,
        popularAccessories
    };
}

/**
 * Homepage hero data structure from Firestore.
 */
export interface HomepageHeroData {
    heroTitle: string;
    heroSubtitle: string;
    heroImageUrl: string;
}

/**
 * Fetches homepage hero data from Firebase Realtime Database /homeScreenData.
 * 
 * **Data Source:** Firebase Realtime Database at `/homeScreenData`
 * **URL:** https://letsridecycles-default-rtdb.firebaseio.com/homeScreenData
 * 
 * **Performance Optimization:**
 * - Single Realtime DB read (exactly 1 database operation)
 * - Uses React cache() for automatic caching across server requests
 * - Implements retry logic for connection resilience
 * 
 * **Caching Strategy:**
 * - Cached for the duration of the server request
 * - Automatically revalidated on new deployments
 * - No additional cache TTL needed due to infrequent updates
 * 
 * **Error Handling:**
 * - Returns fallback values if data doesn't exist
 * - Validates data structure before returning
 * - Logs errors but doesn't throw to prevent homepage failures
 * 
 * @returns {Promise<HomepageHeroData>} Hero banner data with title, subtitle, and image URL
 * 
 * @example
 * ```typescript
 * const heroData = await fetchHomepageHeroData();
 * // Uses cached result if called multiple times in same request
 * ```
 */
export const fetchHomepageHeroData = cache(async (): Promise<HomepageHeroData> => {
    return retryOperation(async () => {
        try {
            const realtimeDb = getDatabase();
            const ref = realtimeDb.ref('homeScreenData');
            const snapshot = await ref.once('value');
            const data = snapshot.val();

            if (!data) {
                console.warn('Homepage hero data not found in Realtime DB, using fallback data');
                return {
                    heroTitle: "Sale: Up To 40% Off",
                    heroSubtitle: "Discover premium bikes, gear, and accessories for your next adventure",
                    heroImageUrl: "/images/hero_lg.png"
                };
            }

            // Validate required fields and return data from Realtime DB
            const heroData: HomepageHeroData = {
                heroTitle: data?.heroTitle || "Summer Sale: Up To 40% Off",
                heroSubtitle: data?.heroSubtitle || "Discover premium bikes, gear, and accessories for your next adventure",
                heroImageUrl: data?.heroImageUrl || "/images/hero_lg.png"
            };

            return heroData;

        } catch (error) {
            console.error('Error fetching homepage hero data from Realtime DB:', error);
            // Return fallback data to prevent homepage failure
            return {
                heroTitle: "Summer Sale: Up To 40% Off",
                heroSubtitle: "Discover premium bikes, gear, and accessories for your next adventure",
                heroImageUrl: "/images/hero_lg.png"
            };
        }
    });
});
