import { adminDb } from '../firebase/admin';
import { cache } from 'react';

/**
 * Type definitions for category data structure.
 * All category data is stored and fetched from Firestore (not Realtime DB).
 * 
 * **Data Architecture:**
 * - Categories contain multiple subcategories
 * - Each subcategory has associated brands
 * - Pre-computed lookups for performance optimization
 */

/** Individual brand entity */
export interface Brand {
    name: string;
}

/** Subcategory with associated brands */
export interface Subcategory {
    name: string;
    brands: string[];
}

/** Category containing subcategories and their brands */
export interface Category {
    name: string;
    subcategories: Record<string, { brands: string[] }>;
}

/**
 * Complete category data structure with pre-computed lookups.
 * 
 * **Pre-computed Fields:**
 * - `allBrands`: Unique list of all brands across categories
 * - `brandsByCategory`: Brands organized by top-level category
 * - `subcategoriesByCategory`: Subcategories organized by category
 * - `brandsBySubcategory`: Brands organized by category > subcategory
 */
export interface CategoriesData {
    /** Raw category data from Firestore */
    categories: Record<string, Category>;
    /** Subcategories grouped by parent category */
    subcategoriesByCategory: Record<string, string[]>;
    /** Brands organized by category and subcategory */
    brandsBySubcategory: Record<string, Record<string, string[]>>;
    /** All unique brands across the entire catalog */
    allBrands: string[];
    /** All brands within each top-level category */
    brandsByCategory: Record<string, string[]>;
}

/**
 * Fetches and processes category data from Firestore with React caching.
 * 
 * **Caching Strategy:**
 * - Uses React's `cache()` for request-level deduplication
 * - Data cached for the duration of the server request
 * - Reduces Firestore reads for multiple category queries
 * 
 * **Data Processing:**
 * 1. Fetches raw category document from Firestore
 * 2. Pre-computes lookup tables for efficient filtering
 * 3. Generates flat brand lists for search functionality
 * 
 * **Error Handling:**
 * - Returns empty data structure if document doesn't exist
 * - Logs errors for debugging while maintaining app stability
 * 
 * @returns Promise resolving to complete category data with pre-computed lookups
 * 
 * @example
 * ```typescript
 * const categoryData = await getCategoriesFromDB();
 * 
 * // Get all bike subcategories
 * const bikeSubcats = categoryData.subcategoriesByCategory['Bikes'];
 * 
 * // Get brands for mountain bikes
 * const mountainBikeBrands = categoryData.brandsBySubcategory['Bikes']['Mountain'];
 * 
 * // Get all brands in accessories category
 * const accessoryBrands = categoryData.brandsByCategory['Accessories'];
 * ```
 */
export const getCategoriesFromDB = cache(async (): Promise<CategoriesData> => {
    try {
        const docRef = adminDb.collection('categories').doc('all');
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            console.error('No category data found in Firestore');
            return {
                categories: {},
                subcategoriesByCategory: {},
                brandsBySubcategory: {},
                allBrands: [],
                brandsByCategory: {}
            };
        }

        const rawData = snapshot.data() || {};

        // Transform the data into more usable formats for the UI
        const subcategoriesByCategory: Record<string, string[]> = {};
        const brandsBySubcategory: Record<string, Record<string, string[]>> = {};
        const brandsByCategory: Record<string, string[]> = {};
        const allBrandsSet = new Set<string>();

        // For each category, extract its subcategories
        for (const [categoryName, categoryData] of Object.entries(rawData)) {
            const subcategories = (categoryData as any).subcategories || {};
            subcategoriesByCategory[categoryName] = Object.keys(subcategories);
            brandsByCategory[categoryName] = [];

            // For each subcategory, extract its brands
            brandsBySubcategory[categoryName] = {};
            for (const [subcategoryName, subcategoryData] of Object.entries(subcategories)) {
                const brands = (subcategoryData as any).brands || [];
                brandsBySubcategory[categoryName][subcategoryName] = brands;

                // Add brands to the category's brand set
                brands.forEach((brand: string) => {
                    // Add to all brands set
                    allBrandsSet.add(brand);

                    // Add to category brands if not already included
                    if (!brandsByCategory[categoryName].includes(brand)) {
                        brandsByCategory[categoryName].push(brand);
                    }
                });
            }

            // Sort the brands for this category
            brandsByCategory[categoryName].sort();
        }

        // Convert the Set to a sorted array
        const allBrands = Array.from(allBrandsSet).sort();

        return {
            categories: rawData as any,
            subcategoriesByCategory,
            brandsBySubcategory,
            allBrands,
            brandsByCategory
        };
    } catch (error) {
        console.error('Error fetching categories:', error);
        return {
            categories: {},
            subcategoriesByCategory: {},
            brandsBySubcategory: {},
            allBrands: [],
            brandsByCategory: {}
        };
    }
});


/**
 * Gets all brands available for a specific subcategory.
 * 
 * @param category - Parent category name (e.g., "Bikes")
 * @param subcategory - Subcategory name (e.g., "Mountain")
 * @returns Promise resolving to array of brand names in that subcategory
 * 
 * @example
 * ```typescript
 * const mountainBikeBrands = await getBrandsForSubcategory('Bikes', 'Mountain');
 * // Returns: ['Trek', 'Giant', 'Specialized', ...]
 * ```
 */
export const getBrandsForSubcategory = cache(async (category: string, subcategory: string): Promise<string[]> => {
    const { brandsBySubcategory } = await getCategoriesFromDB();
    return brandsBySubcategory[category]?.[subcategory] || [];
});

/**
 * Gets all brands available in a top-level category.
 * 
 * Returns a deduplicated list of all brands across all subcategories
 * within the specified category.
 * 
 * @param category - Category name (e.g., "Bikes", "Accessories")
 * @returns Promise resolving to array of brand names in that category
 * 
 * @example
 * ```typescript
 * const bikeBrands = await getBrandsForCategory('Bikes');
 * // Returns all brands that make any type of bike
 * ```
 */
export const getBrandsForCategory = cache(async (category: string): Promise<string[]> => {
    const { brandsByCategory } = await getCategoriesFromDB();
    return brandsByCategory[category] || [];
});

/**
 * Gets all available brands across the entire product catalog.
 * 
 * Returns a sorted, deduplicated list of every brand name
 * that appears in any category or subcategory.
 * 
 * @returns Promise resolving to array of all brand names
 * 
 * @example
 * ```typescript
 * const allBrands = await getAllBrands();
 * // Returns: ['Cannondale', 'Giant', 'Specialized', 'Trek', ...]
 * ```
 */
export const getAllBrands = cache(async (): Promise<string[]> => {
    const { allBrands } = await getCategoriesFromDB();
    return allBrands;
});
