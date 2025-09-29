import { NextResponse } from 'next/server';
import { fetchFilteredProducts, fetchProducts } from '@/lib/server/products.server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;

  // If no query params provided, return all products
  if (!Array.from(params.keys()).length) {
    const all = await fetchProducts();
    return NextResponse.json(all);
  }

  const categories = params.get('categories') ? params.get('categories')!.split(',') : undefined;
  const brands = params.get('brands') ? params.get('brands')!.split(',') : undefined;
  const minPrice = params.get('minPrice') ? Number(params.get('minPrice')) : undefined;
  const maxPrice = params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined;
  const sortBy = params.get('sortBy') as any;
  const pageSize = params.get('pageSize') ? Number(params.get('pageSize')) : undefined;
  const startAfterId = params.get('startAfterId') || undefined;

  const products = await fetchFilteredProducts({
    categories,
    brands,
    minPrice,
    maxPrice,
    sortBy,
    pageSize,
    startAfterId
  });
  return NextResponse.json(products);
}
