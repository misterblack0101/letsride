import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/server/products.server';

/**
 * Handles POST requests to fetch product data for given slugs.
 *
 * @param req - The HTTP request object.
 * @returns The HTTP response object.
 */
export async function POST(req: NextRequest) {
    const { slugs } = await req.json();

    if (!Array.isArray(slugs)) {
        return NextResponse.json({ error: 'Invalid request body. Expected an array of slugs.' }, { status: 400 });
    }

    try {
        const products = await Promise.all(slugs.map((slug) => getProductBySlug(slug)));
        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch product data.' }, { status: 500 });
    }
}

/**
 * Handles unsupported HTTP methods.
 *
 * @param req - The HTTP request object.
 * @returns The HTTP response object.
 */
export async function unsupportedMethod(req: NextRequest) {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}