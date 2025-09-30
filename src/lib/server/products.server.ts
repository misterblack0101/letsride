import { adminDb as db } from '../firebase/admin';
import { CollectionReference } from 'firebase-admin/firestore';
import { ProductSchema, Product } from '../models/Product';
import { retryOperation } from './retry';

// Runtime guard: fail fast if this file is imported in a browser/client environment.
if (typeof window !== 'undefined') {
    throw new Error('server/products.server.ts is server-only and must not be imported from client-side code');
}

/**
 * Filter and pagination options for product queries.
 * Supports complex filtering with Firestore composite indexes.
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
    /** Number of products to return per page. Default: 20. Used for cursor-based pagination. */
    pageSize?: number;
    /** Document ID to start after for cursor-based pagination. Enables efficient large dataset navigation. */
    startAfterId?: string;
}

import { createQueryBuilder } from './firestore-query-builder';

/**
 * Fetches filtered products from Firestore with advanced filtering and pagination.
 * 
 * This function builds complex Firestore queries using the query builder pattern.
 * It supports category/brand filtering, price ranges, sorting, and cursor-based pagination.
 * 
 * **Important**: Complex filter combinations require Firestore composite indexes.
 * The console will show index creation links when new combinations are used.
 * 
 * @param filters - Filter and pagination options
 * @param filters.categories - Filter by product categories (uses 'in' operator)
 * @param filters.brands - Filter by product brands (uses 'in' operator) 
 * @param filters.minPrice - Minimum price filter (inclusive)
 * @param filters.maxPrice - Maximum price filter (inclusive)
 * @param filters.sortBy - Sort order: 'name', 'price_low', 'price_high', 'rating'
 * @param filters.pageSize - Products per page (default: 20)
 * @param filters.startAfterId - Document ID for cursor pagination
 * 
 * @returns Promise resolving to array of filtered products
 * 
 * @throws {Error} When Firestore composite indexes are missing
 * @throws {Error} When Firebase Admin SDK encounters connection issues
 * 
 * @example
 * ```typescript
 * // Basic category filter
 * const bikes = await fetchFilteredProducts({ 
 *   categories: ['Bikes'] 
 * });
 * 
 * // Complex filter with pagination
 * const premiumBikes = await fetchFilteredProducts({
 *   categories: ['Bikes'],
 *   brands: ['Trek', 'Giant'],
 *   minPrice: 500,
 *   maxPrice: 2000,
 *   sortBy: 'price_low',
 *   pageSize: 10,
 *   startAfterId: 'last-product-id'
 * });
 * ```
 */
export async function fetchFilteredProducts(filters: ProductFilterOptions = {}): Promise<Product[]> {
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
            // Note: This requires a composite index to be9 created in Firestore
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

        // Apply pagination with cursor (startAfter)
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

        // Apply page size limit
        if (filters.pageSize && Number.isFinite(filters.pageSize)) {
            queryBuilder.limit(filters.pageSize);
        }

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

        // All filtering, sorting, and pagination has been handled server-side by the query builder
        return products;
    });
}

/**
 * Fetches all products without filtering.
 * 
 * This is a convenience wrapper around fetchFilteredProducts() for backward compatibility.
 * Consider using fetchFilteredProducts() directly for better performance with large datasets.
 * 
 * @returns Promise resolving to array of all products
 * 
 * @example
 * ```typescript
 * const allProducts = await fetchProducts();
 * ```
 */
export async function fetchProducts(): Promise<Product[]> {
    return fetchFilteredProducts();
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

        console.log(`Fetching product with ID: ${id}`);

        const productDocRef = db.collection('products').doc(id);
        const snapshot = await productDocRef.get();

        console.log(`Product snapshot exists: ${snapshot.exists}`);


        if (!snapshot.exists) return null;

        const raw = { ...snapshot.data(), id: snapshot.id, };
        const parsed = ProductSchema.safeParse(raw);

        if (!parsed.success) {
            console.error('Invalid product schema:', parsed.error.format());
            return null;
        }

        console.log(`Product fetched successfully: ${id}`);

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
): Promise<Product[]> {
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

        // Apply limit if provided
        if (options.pageSize && Number.isFinite(options.pageSize)) {
            queryBuilder.limit(options.pageSize);
        }

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
        });

        return products.filter(Boolean) as Product[];
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
