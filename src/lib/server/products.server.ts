import { adminDb as db } from '../firebase/admin';
import { CollectionReference } from 'firebase-admin/firestore';
import { ProductSchema, Product } from '../models/Product';
import { retryOperation } from './retry';

// Runtime guard: fail fast if this file is imported in a browser/client environment.
if (typeof window !== 'undefined') {
    throw new Error('server/products.server.ts is server-only and must not be imported from client-side code');
}

// Filter options interface
export interface ProductFilterOptions {
    categories?: string[];
    brands?: string[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'name' | 'price_low' | 'price_high' | 'rating';
    // Pagination support (pageSize and startAfterId for cursor based paging)
    pageSize?: number;
    startAfterId?: string; // Document ID to start after (for cursor paging)
}

import { createQueryBuilder } from './firestore-query-builder';

// Enhanced fetch function with server-side filtering using query builder
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

// Fetch all products (kept for backward compatibility)
export async function fetchProducts(): Promise<Product[]> {
    return fetchFilteredProducts();
}

// 🔍 Fetch a single product by ID (from Firestore)
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

        // Apply price range filters if provided
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
