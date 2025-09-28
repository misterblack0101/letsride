import { adminDb } from '../firebase/admin';
import { cache } from 'react';

/**
 * Type definitions for category data structure
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
                brandsBySubcategory: {}
            };
        }

        const rawData = snapshot.data() || {};

        // Transform the data into more usable formats for the UI
        const subcategoriesByCategory: Record<string, string[]> = {};
        const brandsBySubcategory: Record<string, Record<string, string[]>> = {};

        // For each category, extract its subcategories
        for (const [categoryName, categoryData] of Object.entries(rawData)) {
            const subcategories = (categoryData as any).subcategories || {};
            subcategoriesByCategory[categoryName] = Object.keys(subcategories);

            // For each subcategory, extract its brands
            brandsBySubcategory[categoryName] = {};
            for (const [subcategoryName, subcategoryData] of Object.entries(subcategories)) {
                brandsBySubcategory[categoryName][subcategoryName] = (subcategoryData as any).brands || [];
            }
        }

        return {
            categories: rawData as any,
            subcategoriesByCategory,
            brandsBySubcategory
        };
    } catch (error) {
        console.error('Error fetching categories:', error);
        return {
            categories: {},
            subcategoriesByCategory: {},
            brandsBySubcategory: {}
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
 * Gets all brands for a specific category by combining brands from all its subcategories
 */
export const getBrandsForCategory = cache(async (category: string): Promise<string[]> => {
    const { brandsBySubcategory } = await getCategoriesFromDB();

    if (!brandsBySubcategory[category]) {
        return [];
    }

    // Combine all brands from the subcategories of this category
    const categoryBrands = new Set<string>();
    Object.values(brandsBySubcategory[category]).forEach(brands => {
        brands.forEach(brand => categoryBrands.add(brand));
    });

    return Array.from(categoryBrands).sort();
});

/**
 * Gets all available brands across all categories
 */
export const getAllBrands = cache(async (): Promise<string[]> => {
    const { brandsBySubcategory } = await getCategoriesFromDB();

    const allBrands = new Set<string>();
    Object.values(brandsBySubcategory).forEach(subcategories => {
        Object.values(subcategories).forEach(brands => {
            brands.forEach(brand => allBrands.add(brand));
        });
    });

    return Array.from(allBrands).sort();
});
