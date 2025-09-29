import { adminDb } from '../firebase/admin';
import { cache } from 'react';

/**
 * Type definitions for category data structure
 * All category data is stored and fetched from Firestore (not Realtime DB)
 */
export interface Brand {
    name: string;
}

export interface Subcategory {
    name: string;
    brands: string[];
}

export interface Category {
    name: string;
    subcategories: Record<string, { brands: string[] }>;
}

export interface CategoriesData {
    categories: Record<string, Category>;
    subcategoriesByCategory: Record<string, string[]>;
    brandsBySubcategory: Record<string, Record<string, string[]>>;
    // Pre-computed data
    allBrands: string[];
    brandsByCategory: Record<string, string[]>;
}

/**
 * Gets all categories with subcategories and brands from Firestore.
 * Uses React's cache to ensure data is only fetched once per session.
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
 * Gets all brands for a specific subcategory
 */
export const getBrandsForSubcategory = cache(async (category: string, subcategory: string): Promise<string[]> => {
    const { brandsBySubcategory } = await getCategoriesFromDB();
    return brandsBySubcategory[category]?.[subcategory] || [];
});

/**
 * Gets all brands for a specific category using pre-computed data
 */
export const getBrandsForCategory = cache(async (category: string): Promise<string[]> => {
    const { brandsByCategory } = await getCategoriesFromDB();
    return brandsByCategory[category] || [];
});

/**
 * Gets all available brands across all categories using pre-computed data
 */
export const getAllBrands = cache(async (): Promise<string[]> => {
    const { allBrands } = await getCategoriesFromDB();
    return allBrands;
});
