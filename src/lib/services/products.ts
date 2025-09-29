// Client-safe wrappers that call server API routes. The real admin-backed
// implementations live in `src/lib/server/products.server.ts` and are only
// imported by server code or API routes.

import type { Product } from '../models/Product';

export interface ProductFilterOptions {
  categories?: string[];
  brands?: string[];
  sortBy?: 'name' | 'price_low' | 'price_high' | 'rating';
  pageSize?: number;
  startAfterId?: string;
}

const API_ROOT = '/api/products';

export async function fetchFilteredProducts(filters: ProductFilterOptions = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters.categories) params.set('categories', filters.categories.join(','));
  if (filters.brands) params.set('brands', filters.brands.join(','));
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  if (filters.startAfterId) params.set('startAfterId', filters.startAfterId);

  const res = await fetch(`${API_ROOT}?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(API_ROOT);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function getFilteredProductsViaCategory(category: string, subcategory: string, options: { sortBy?: ProductFilterOptions['sortBy']; pageSize?: number; startAfterId?: string } = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (options.sortBy) params.set('sortBy', options.sortBy);
  if (options.pageSize) params.set('pageSize', String(options.pageSize));
  if (options.startAfterId) params.set('startAfterId', options.startAfterId);

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