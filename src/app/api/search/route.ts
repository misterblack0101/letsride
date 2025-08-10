import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, getSearchSuggestions } from '@/lib/services/search';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const type = searchParams.get('type') || 'products';
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!query) {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }

        if (type === 'suggestions') {
            const suggestions = await getSearchSuggestions(query);
            return NextResponse.json({ suggestions });
        } else {
            const products = await searchProducts(query, limit);
            return NextResponse.json({ products });
        }
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
