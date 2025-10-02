import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/services/search';
import { headers } from 'next/headers';

// Simple in-memory rate limiting (use Redis in production for multi-instance apps)
const RATE_LIMIT = 100; // requests per minute
const rateLimitMap = new Map<string, number[]>();

/**
 * Rate limiting helper to prevent API abuse
 */
async function checkRateLimit(request: NextRequest): Promise<boolean> {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') ||
        headersList.get('x-real-ip') ||
        'unknown';

    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window

    const requests = rateLimitMap.get(ip) || [];
    const recentRequests = requests.filter(time => time > windowStart);

    if (recentRequests.length >= RATE_LIMIT) {
        return false; // Rate limit exceeded
    }

    rateLimitMap.set(ip, [...recentRequests, now]);
    return true;
}

/**
 * Lightweight search result interface for optimized payloads
 */
interface LightweightSearchResult {
    id: string;
    name: string;
    brand: string;
    price: number;
    discountedPrice?: number;
    rating: number;
    imageUrl: string;
    category: string;
    subCategory: string;
}

export async function GET(request: NextRequest) {
    try {
        // 1. Rate limiting check
        const isAllowed = await checkRateLimit(request);
        if (!isAllowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again in a minute.' },
                { status: 429 }
            );
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');
        const page = Math.floor(offset / limit);

        // 2. Request validation
        if (!query) {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }

        // Validate query length
        if (query.length < 2 || query.length > 100) {
            return NextResponse.json(
                { error: 'Search query must be between 2-100 characters' },
                { status: 400 }
            );
        }

        // Sanitize query - remove potentially harmful characters
        const sanitizedQuery = query.trim().replace(/[<>]/g, '');

        // Search for products
        const products = await searchProducts(sanitizedQuery, limit, undefined, page);

        // Return lightweight payloads - only essential fields
        const lightweightResults: LightweightSearchResult[] = products.map(product => ({
            id: product.id,
            name: product.name,
            brand: product.brand || 'Unknown',
            price: product.price || 0,
            discountedPrice: product.discountedPrice,
            rating: product.rating,
            imageUrl: product.images?.[0] || '/images/placeholder.jpg',
            category: product.category,
            subCategory: product.subCategory
        }));

        // Response caching for products  
        return NextResponse.json({ products: lightweightResults }, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                'CDN-Cache-Control': 'public, s-maxage=300'
            }
        });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
