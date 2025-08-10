import { adminDb as db } from '../firebase/admin';
import { CollectionReference } from 'firebase-admin/firestore';
import { ProductSchema, Product } from '../models/Product';

// Cache for products to avoid repeated Firestore calls
let productsCache: Product[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get cached products or fetch from Firestore
async function getCachedProducts(): Promise<Product[]> {
    const now = Date.now();

    // Return cached products if cache is valid
    if (productsCache && (now - cacheTimestamp) < CACHE_DURATION) {
        return productsCache;
    }

    try {
        const productsCollection = db.collection('products') as CollectionReference;
        const snapshot = await productsCollection.get();

        const products = snapshot.docs
            .map(doc => {
                const raw = { ...doc.data(), id: doc.id };
                const parsed = ProductSchema.safeParse(raw);
                if (!parsed.success) {
                    console.warn('Invalid product skipped in search:', parsed.error.format());
                    return null;
                }
                return parsed.data;
            })
            .filter(Boolean) as Product[];

        // Update cache
        productsCache = products;
        cacheTimestamp = now;

        return products;
    } catch (error) {
        console.error('Error fetching products for search:', error);
        return productsCache || []; // Return cached data if available, or empty array
    }
}

// Search products by name, brand, category, and description
export async function searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const searchTerms = normalizedQuery.split(' ').filter(term => term.length > 0);

    try {
        const products = await getCachedProducts();

        // Enhanced search with multiple terms support
        const searchResults = products
            .map(product => {
                const searchableText = [
                    product.name,
                    product.brand,
                    product.category,
                    product.subCategory,
                    product.details,
                    product.shortDescription
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();

                // Calculate relevance score
                let score = 0;

                // Exact phrase match gets highest score
                if (searchableText.includes(normalizedQuery)) {
                    score += 100;
                }

                // Count individual term matches
                const termMatches = searchTerms.filter(term => searchableText.includes(term)).length;
                score += (termMatches / searchTerms.length) * 50;

                // Boost for name matches
                if (product.name.toLowerCase().includes(normalizedQuery)) {
                    score += 75;
                }

                // Boost for brand matches
                if (product.brand && product.brand.toLowerCase().includes(normalizedQuery)) {
                    score += 25;
                }

                return score > 0 ? { product, score } : null;
            })
            .filter(Boolean)
            .sort((a, b) => {
                // Sort by relevance score first, then by rating
                if (b!.score !== a!.score) {
                    return b!.score - a!.score;
                }
                return b!.product.rating - a!.product.rating;
            })
            .slice(0, limit)
            .map(item => item!.product);

        return searchResults;
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

// Get search suggestions based on query
export async function getSearchSuggestions(query: string): Promise<string[]> {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const normalizedQuery = query.toLowerCase().trim();

    try {
        const products = await getCachedProducts();
        const suggestions = new Set<string>();

        products.forEach(product => {
            // Add matching product names (prioritize exact word matches)
            if (product.name.toLowerCase().includes(normalizedQuery)) {
                suggestions.add(product.name);
            }

            // Add matching brands
            if (product.brand && product.brand.toLowerCase().includes(normalizedQuery)) {
                suggestions.add(product.brand);
            }

            // Add matching categories
            if (product.category && product.category.toLowerCase().includes(normalizedQuery)) {
                suggestions.add(product.category);
            }

            // Add matching subcategories
            if (product.subCategory && product.subCategory.toLowerCase().includes(normalizedQuery)) {
                suggestions.add(product.subCategory);
            }
        });

        // Convert to array and sort by relevance
        return Array.from(suggestions)
            .sort((a, b) => {
                // Prioritize items that start with the query
                const aStarts = a.toLowerCase().startsWith(normalizedQuery);
                const bStarts = b.toLowerCase().startsWith(normalizedQuery);

                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;

                // Then by length (shorter is more relevant)
                return a.length - b.length;
            })
            .slice(0, 5);
    } catch (error) {
        console.error('Suggestions error:', error);
        return [];
    }
}
