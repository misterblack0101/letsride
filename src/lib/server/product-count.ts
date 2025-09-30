import { adminDb } from '../firebase/admin';
import { CollectionReference } from 'firebase-admin/firestore';
import { retryOperation } from './retry';

/**
 * Get the count of documents in a collection that match specific filters
 * Uses Firestore aggregation queries (available in Firebase 9.1+)
 */
export async function getProductCount(filters: {
    category?: string;
    subcategory?: string;
    brands?: string[];
    minPrice?: number;
    maxPrice?: number;
}): Promise<number> {
    return retryOperation(async () => {
        const productsRef = adminDb.collection('products') as CollectionReference;

        // Start building the query
        let query: any = productsRef;

        // Apply category filter
        if (filters.category) {
            query = query.where('category', '==', filters.category);
        }

        // Apply subcategory filter
        if (filters.subcategory) {
            query = query.where('subCategory', '==', filters.subcategory);
        }

        // Apply brand filter - handle both single and multiple brands like fetchFilteredProducts does
        if (filters.brands && filters.brands.length > 0) {
            if (filters.brands.length === 1) {
                query = query.where('brand', '==', filters.brands[0]);
            } else {
                query = query.where('brand', 'in', filters.brands);
            }
        }

        // Apply price range filters
        if (filters.minPrice !== undefined) {
            query = query.where('price', '>=', filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
            query = query.where('price', '<=', filters.maxPrice);
        }

        // First try using aggregation query if supported
        try {
            // This method requires Firebase 9.1+ and Firestore Native Mode
            const snapshot = await query.count().get();
            return snapshot.data().count;
        } catch (error) {
            console.warn('Aggregation query not supported, falling back to get().size', error);

            // Fallback: fetch documents and count them client-side
            // This is less efficient but works on all Firebase versions
            const snapshot = await query.get();
            return snapshot.size;
        }
    });
}