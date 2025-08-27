import { NextResponse } from 'next/server';
import { getFilteredProductsViaCategory } from '@/lib/server/products.server';

export async function GET(request: Request, { params }: { params: { category: string; subcategory: string } }) {
  const url = new URL(request.url);
  const qp = url.searchParams;
  const sortBy = qp.get('sortBy') as any;
  const pageSize = qp.get('pageSize') ? Number(qp.get('pageSize')) : undefined;
  const startAfterId = qp.get('startAfterId') || undefined;

  const products = await getFilteredProductsViaCategory(params.category, params.subcategory, { sortBy, pageSize, startAfterId });
  return NextResponse.json(products);
}
