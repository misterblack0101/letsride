import { NextResponse } from 'next/server';
import { fetchFilteredProducts } from '@/lib/server/products.server';

/**
 * GET /api/products - Infinite scroll optimized product API
 * 
 * **Cost Optimization Strategy:**
 * - Removed offset-based pagination to eliminate expensive skip operations
 * - Uses cursor-based pagination exclusively via `startAfterId`
 * - Always returns paginated results (no "all products" option)
 * - Optimized for infinite scroll UX pattern
 * 
 * **Query Parameters:**
 * - `categories`: Comma-separated category names
 * - `brands`: Comma-separated brand names  
 * - `minPrice`, `maxPrice`: Price range filters
 * - `sortBy`: Sort order (name, price_low, price_high, rating)
 * - `pageSize`: Items per page (default: 20)
 * - `startAfterId`: Document ID to start after (cursor pagination)
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
 * - 400: Invalid query parameters
 * - 500: Server/database errors
 * - 503: Service temporarily unavailable
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    // Parse and validate query parameters
    const categories = params.get('categories') ? params.get('categories')!.split(',').filter(Boolean) : undefined;
    const brands = params.get('brands') ? params.get('brands')!.split(',').filter(Boolean) : undefined;

    // Validate numeric parameters
    const minPriceParam = params.get('minPrice');
    const maxPriceParam = params.get('maxPrice');
    const pageSizeParam = params.get('pageSize');

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

    const sortBy = params.get('sortBy') as any;
    const startAfterId = params.get('startAfterId') || undefined;

    const result = await fetchFilteredProducts({
      categories,
      brands,
      minPrice,
      maxPrice,
      sortBy,
      pageSize,
      startAfterId
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in /api/products:', error);

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
