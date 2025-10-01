import { NextResponse } from 'next/server';
import { getFilteredProductsViaCategory } from '@/lib/server/products.server';

/**
 * GET /api/products/category/[category]/[subcategory] - Category-specific infinite scroll API
 * 
 * **Cost Optimization:**
 * - Cursor-based pagination only (no offset-based fallbacks)
 * - Consistent API format with main products endpoint
 * - Optimized for infinite scroll UX
 * 
 * **Response Format:**
 * ```json
 * {
 *   "products": Product[],
 *   "hasMore": boolean,
 *   "lastProductId": string | undefined
 * }
 * ```
 * 
 * **Error Responses:**
 * - 400: Invalid query parameters or category/subcategory
 * - 500: Server/database errors
 * - 503: Service temporarily unavailable
 * 
 * **Note:** Returns 200 with empty results instead of 404 for "no products found"
 * to allow the UI to handle the empty state gracefully without triggering Next.js error pages.
 */
export async function GET(request: Request, { params }: { params: Promise<{ category: string; subcategory: string }> }) {
  try {
    const url = new URL(request.url);
    const qp = url.searchParams;

    // Parse and validate query parameters
    const brands = qp.get('brands') ? qp.get('brands')!.split(',').filter(Boolean) : undefined;

    // Validate numeric parameters
    const minPriceParam = qp.get('minPrice');
    const maxPriceParam = qp.get('maxPrice');
    const pageSizeParam = qp.get('pageSize');

    const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
    const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;
    const pageSize = pageSizeParam ? Number(pageSizeParam) : 20;

    // Validate numeric inputs
    if ((minPriceParam && isNaN(minPrice!)) ||
      (maxPriceParam && isNaN(maxPrice!)) ||
      (pageSizeParam && isNaN(pageSize))) {
      return NextResponse.json(
        { error: 'Invalid numeric parameters. Price and pageSize must be valid numbers.' },
        { status: 400 }
      );
    }

    // Validate price range
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      return NextResponse.json(
        { error: 'Invalid price range. Minimum price cannot be greater than maximum price.' },
        { status: 400 }
      );
    }

    // Validate page size
    if (pageSize <= 0 || pageSize > 100) {
      return NextResponse.json(
        { error: 'Invalid page size. Must be between 1 and 100.' },
        { status: 400 }
      );
    }

    const sortBy = qp.get('sortBy') as any;
    const startAfterId = qp.get('startAfterId') || undefined;

    // Await params before using in Next.js 15
    const { category, subcategory } = await params;

    // Validate category and subcategory parameters
    if (!category?.trim() || !subcategory?.trim()) {
      return NextResponse.json(
        { error: 'Category and subcategory are required.' },
        { status: 400 }
      );
    }

    const result = await getFilteredProductsViaCategory(category, subcategory, {
      sortBy,
      pageSize,
      startAfterId,
      brands,
      minPrice,
      maxPrice
    });

    // Always return 200 with empty results - let the UI handle "no products found" state
    // This prevents Next.js from showing the technical error page
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error in /api/products/category API:`, error);

    // Classify error types for appropriate responses
    const errorCode = error.code || error.status;

    if (errorCode === 'permission-denied' || errorCode === 'unauthenticated') {
      return NextResponse.json(
        { error: 'Database access denied. Please try again later.' },
        { status: 403 }
      );
    }

    if (errorCode === 'unavailable' || errorCode === 'deadline-exceeded') {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      );
    }

    if (errorCode === 'failed-precondition' || errorCode === 'resource-exhausted') {
      return NextResponse.json(
        { error: 'Service capacity exceeded. Please try again later.' },
        { status: 503 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
