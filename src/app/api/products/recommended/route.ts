import { NextResponse } from 'next/server';
import { fetchRecommendedProducts } from '@/lib/server/products.server';

export async function GET() {
  const prods = await fetchRecommendedProducts();
  return NextResponse.json(prods);
}
