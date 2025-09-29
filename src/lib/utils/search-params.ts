import { z } from 'zod';

/**
 * Schema for validating product filter search params
 */
export const ProductFilterSchema = z.object({
    brand: z.union([z.string(), z.array(z.string())]).optional(),
    minPrice: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    maxPrice: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    sort: z.enum(['name', 'price_low', 'price_high', 'rating']).default('rating'),
    view: z.enum(['grid', 'list']).default('grid'),
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    lastId: z.string().optional(),
});

/**
 * Type definition for product filter parameters
 */
export type ProductFilterParams = z.infer<typeof ProductFilterSchema>;

/**
 * Parses and validates search parameters for product filtering
 */
export function parseProductFilterParams(searchParams: Record<string, string | string[]>) {
    try {
        // Parse the search parameters using Zod schema
        const parsed = ProductFilterSchema.parse(searchParams);

        // Process brands to ensure consistent array format
        const brands = Array.isArray(parsed.brand)
            ? parsed.brand
            : parsed.brand ? [parsed.brand] : [];

        return {
            brands,
            minPrice: parsed.minPrice,
            maxPrice: parsed.maxPrice,
            sortBy: parsed.sort,
            viewMode: parsed.view,
            page: parsed.page || 1,
            lastId: parsed.lastId,
            isValid: true,
        };
    } catch (error) {
        // Log validation errors but still return default values
        console.error('Search parameter validation error:', error);
        return {
            brands: [],
            minPrice: undefined,
            maxPrice: undefined,
            sortBy: 'rating' as const,
            viewMode: 'grid' as const,
            page: 1,
            lastId: undefined,
            isValid: false,
        };
    }
}

/**
 * Creates a new search parameter string from the current params and updates
 */
export function updateSearchParams(
    currentParams: URLSearchParams,
    updates: Partial<{
        brand: string[] | null;
        minPrice: number | null;
        maxPrice: number | null;
        sort: string | null;
        view: string | null;
        page: number | null;
        lastId: string | null;
    }>
): string {
    const params = new URLSearchParams(currentParams);

    // Helper function to update a parameter
    const updateParam = (key: string, value: any) => {
        if (value === null) {
            params.delete(key);
        } else if (Array.isArray(value)) {
            params.delete(key);
            if (value.length > 0) {
                value.forEach(v => params.append(key, v));
            }
        } else if (value !== undefined) {
            params.set(key, value.toString());
        }
    };

    // Apply all updates
    Object.entries(updates).forEach(([key, value]) => {
        updateParam(key, value);
    });

    return params.toString();
}