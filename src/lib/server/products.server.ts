import { adminDb as db } from '../firebase/admin';
import { CollectionReference } from 'firebase-admin/firestore';
import { ProductSchema, Product } from '../models/Product';

// Retry helper function
async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            // Wait before retrying (exponential backoff)
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
            console.log(`Retrying operation, attempt ${attempt + 1}/${maxRetries}`);
        }
    }
    throw new Error('Max retries exceeded');
}

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
    sortBy?: 'name' | 'price_low' | 'price_high' | 'rating' | 'popularity';
    // Pagination support (pageSize and startAfterId for cursor based paging)
    pageSize?: number;
    startAfterId?: string; // Document ID to start after (for cursor paging)
}

// Enhanced fetch function with server-side filtering
export async function fetchFilteredProducts(filters: ProductFilterOptions = {}): Promise<Product[]> {
    return retryOperation(async () => {
        const productsCollection = db.collection('products') as CollectionReference;
        let query: any = productsCollection;

        // Apply Firestore filters where possible
        if (filters.categories && filters.categories.length === 1) {
            // Firestore can only filter by one category at a time efficiently
            query = query.where('category', '==', filters.categories[0]);
        }

        if (filters.brands && filters.brands.length === 1) {
            // Firestore can only filter by one brand at a time efficiently
            query = query.where('brand', '==', filters.brands[0]);
        }

        // Apply ordering for server-side sorting if requested
        if (filters.sortBy) {
            const { field, direction } = (() => {
                switch (filters.sortBy) {
                    case 'name':
                        return { field: 'name', direction: 'asc' as const };
                    case 'price_low':
                        return { field: 'price', direction: 'asc' as const };
                    case 'price_high':
                        return { field: 'price', direction: 'desc' as const };
                    case 'rating':
                        return { field: 'rating', direction: 'desc' as const };
                    case 'popularity':
                    default:
                        return { field: 'rating', direction: 'desc' as const };
                }
            })();

            query = query.orderBy(field, direction);
        }

        // Apply pagination: startAfterId and pageSize
        if (filters.startAfterId) {
            try {
                const startDoc = await db.collection('products').doc(filters.startAfterId).get();
                if (startDoc.exists) query = query.startAfter(startDoc);
            } catch (err) {
                console.warn('startAfterId not found or error fetching start doc:', err);
            }
        }

        if (filters.pageSize && Number.isFinite(filters.pageSize)) {
            query = query.limit(filters.pageSize);
        }

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

        // Apply client-side filters for complex filtering
        let filteredProducts = products;

        // Filter by multiple categories (if more than one)
        if (filters.categories && filters.categories.length > 1) {
            filteredProducts = filteredProducts.filter(p =>
                filters.categories!.includes(p.category)
            );
        }

        // Filter by multiple brands (if more than one)
        if (filters.brands && filters.brands.length > 1) {
            filteredProducts = filteredProducts.filter(p =>
                p.brand && filters.brands!.includes(p.brand)
            );
        }

        // Filter by price range
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            const minPrice = filters.minPrice ?? 0;
            const maxPrice = filters.maxPrice ?? Number.MAX_SAFE_INTEGER;
            filteredProducts = filteredProducts.filter(p =>
                p.price >= minPrice && p.price <= maxPrice
            );
        }

        // Sort products
        // If the server already applied ordering (via query.orderBy) we keep server order.
        // Otherwise apply client-side sort as before.
        if (!filters.sortBy) {
            // apply the same local sorting logic
            filteredProducts.sort((a, b) => b.rating - a.rating);
        }

        return filteredProducts;
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
    options: { sortBy?: ProductFilterOptions['sortBy']; pageSize?: number; startAfterId?: string } = {}
): Promise<Product[]> {
    const productsRef = db.collection('products') as CollectionReference;
    // the category/subcategory might have characters like %20... so parse it before checking
    category = decodeURIComponent(category);
    subcategory = decodeURIComponent(subcategory);

    let query: any = productsRef.where('category', '==', category).where('subCategory', '==', subcategory);

    // Server-side ordering
    if (options.sortBy) {
        const { field, direction } = (() => {
            switch (options.sortBy) {
                case 'name':
                    return { field: 'name', direction: 'asc' as const };
                case 'price_low':
                    return { field: 'price', direction: 'asc' as const };
                case 'price_high':
                    return { field: 'price', direction: 'desc' as const };
                case 'rating':
                    return { field: 'rating', direction: 'desc' as const };
                case 'popularity':
                default:
                    return { field: 'rating', direction: 'desc' as const };
            }
        })();

        query = query.orderBy(field, direction);
    }

    // Pagination support
    if (options.startAfterId) {
        try {
            const startDoc = await db.collection('products').doc(options.startAfterId).get();
            if (startDoc.exists) query = query.startAfter(startDoc);
        } catch (err) {
            console.warn('startAfterId not found or error fetching start doc:', err);
        }
    }

    if (options.pageSize && Number.isFinite(options.pageSize)) {
        query = query.limit(options.pageSize);
    }

    const querySnapshot = await query.get();

    const products = querySnapshot.docs.map((doc: any) => {
        const raw = { ...doc.data(), id: doc.id, };
        const parsed = ProductSchema.safeParse(raw);
        if (!parsed.success) {
            console.warn('Invalid product skipped:', parsed.error.format());
            return null;
        }
        return parsed.data;
    });

    return products.filter(Boolean) as Product[];
}

export async function fetchRecommendedProducts(): Promise<Product[]> {
    return retryOperation(async () => {
        const productsCollection = db.collection('products') as CollectionReference;
        // Example: fetch products ordered by a 'popularity' field, descending
        const snapshot = await productsCollection
            .where('isRecommended', '==', true)
            .get();

        const products = snapshot.docs.map(doc => {
            const raw = { ...doc.data(), id: doc.id, };
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
