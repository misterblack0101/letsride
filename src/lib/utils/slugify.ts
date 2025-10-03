import slugify from 'slugify';

/**
 * Converts a product name to a URL-safe slug.
 * - Lowercase
 * - Spaces to dashes
 * - Removes special characters
 * @param name - Product name
 * @returns Slug string
 */
export function getProductSlug(name: string): string {
    return slugify(name, { lower: true, strict: true });
}
