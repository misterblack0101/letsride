// Client-safe wrappers that call server API routes for infinite scroll.
// The real admin-backed implementations live in `src/lib/server/products.server.ts`
// and are only imported by server code or API routes.

import type { Product } from '../models/Product';

/**
 * Filter options for infinite scroll product queries.
 */
export interface ProductFilterOptions {
  categories?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price_low' | 'price_high' | 'rating';
  pageSize?: number;
  startAfterId?: string;
}

/**
 * Response format for infinite scroll product queries.
 */
export interface InfiniteScrollResponse {
  products: Product[];
  hasMore: boolean;
  lastProductId?: string;
}

const API_ROOT = '/api/products';

/**
 * Fetches filtered products with infinite scroll support.
 * 
 * **Cost Optimization:**
 * - Uses cursor-based pagination exclusively
 * - Returns metadata needed for infinite scroll UI
 * - Eliminates expensive offset queries
 * 
 * @param filters - Filter and pagination options
 * @returns Promise resolving to infinite scroll response
 */
export async function fetchFilteredProducts(filters: ProductFilterOptions = {}): Promise<InfiniteScrollResponse> {
  const params = new URLSearchParams();
  if (filters.categories) params.set('categories', filters.categories.join(','));
  if (filters.brands) params.set('brands', filters.brands.join(','));
  if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  if (filters.startAfterId) params.set('startAfterId', filters.startAfterId);

  const res = await fetch(`${API_ROOT}?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

/**
 * Fetches first batch of products (backward compatibility).
 * 
 * @deprecated Use fetchFilteredProducts() for better infinite scroll support
 */
export async function fetchProducts(): Promise<Product[]> {
  const result = await fetchFilteredProducts();
  return result.products;
}

/**
 * Fetches category-specific products with infinite scroll support.
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
): Promise<InfiniteScrollResponse> {
  const params = new URLSearchParams();
  if (options.sortBy) params.set('sortBy', options.sortBy);
  if (options.pageSize) params.set('pageSize', String(options.pageSize));
  if (options.startAfterId) params.set('startAfterId', options.startAfterId);
  if (options.brands) params.set('brands', options.brands.join(','));
  if (options.minPrice) params.set('minPrice', String(options.minPrice));
  if (options.maxPrice) params.set('maxPrice', String(options.maxPrice));

  const encodedCategory = encodeURIComponent(category);
  const encodedSubcategory = encodeURIComponent(subcategory);

  const res = await fetch(`${API_ROOT}/category/${encodedCategory}/${encodedSubcategory}?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch category products');
  return res.json();
}

export async function fetchRecommendedProducts(): Promise<Product[]> {
  const res = await fetch(`${API_ROOT}/recommended`);
  if (!res.ok) throw new Error('Failed to fetch recommended products');
  return res.json();
}