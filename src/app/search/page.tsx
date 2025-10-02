import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import type { Product } from '@/lib/models/Product';
import ProductCard from '@/components/products/ProductCard';

interface SearchPageProps {
    searchParams: Promise<{ q?: string }>;
}

// Interface for lightweight search results from API
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

// Convert lightweight results to Product format for ProductCard
function convertToProducts(lightweightResults: LightweightSearchResult[]): Product[] {
    return lightweightResults.map(result => ({
        id: result.id,
        name: result.name,
        brand: result.brand,
        category: result.category,
        subCategory: result.subCategory,
        price: result.price,
        discountedPrice: result.discountedPrice || result.price,
        actualPrice: result.price,
        rating: result.rating,
        images: result.imageUrl ? [result.imageUrl] : ['/images/placeholder.jpg'],
        brandLogo: '/images/placeholder.jpg', // Use placeholder instead of empty string
        inventory: 1, // Assume in stock for search results
        isRecommended: false,
        shortDescription: '',
        details: '',
        tags: []
    }));
}

async function searchProductsViaAPI(query: string, limit: number = 50): Promise<Product[]> {
    try {
        const baseUrl = process.env.NODE_ENV === 'production'
            ? 'https://your-domain.com' // Replace with your actual domain
            : 'http://localhost:9002';

        const response = await fetch(
            `${baseUrl}/api/search?q=${encodeURIComponent(query)}&limit=${limit}`,
            {
                next: { revalidate: 300 } // Cache for 5 minutes on server side too
            }
        );

        if (!response.ok) {
            console.error('Search API error:', response.status, response.statusText);
            return [];
        }

        const data = await response.json();
        const lightweightResults: LightweightSearchResult[] = data.products || [];

        // Convert to full Product format for ProductCard
        return convertToProducts(lightweightResults);
    } catch (error) {
        console.error('Failed to fetch search results:', error);
        return [];
    }
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
    const params = await searchParams;
    const query = params.q || '';

    return {
        title: query ? `Search results for "${query}" | Let's Ride` : 'Search | Let\'s Ride',
        description: query ? `Find cycling products matching "${query}"` : 'Search for cycling products and gear',
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const query = params.q || '';

    const products = query ? await searchProductsViaAPI(query, 50) : [];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back link */}
            <div className="mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary-focus transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>

            {/* Search header */}
            <div className="mb-8">
                {query ? (
                    <>
                        <h1 className="text-3xl font-bold font-headline mb-2">
                            Search Results for <span className="text-primary">&ldquo;{query}&rdquo;</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Showing top {products.length} product{products.length !== 1 ? 's' : ''}
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold font-headline mb-2">Search Products</h1>
                        <p className="text-muted-foreground">Enter a search term to find products</p>
                    </>
                )}
            </div>

            {/* Results */}
            {query ? (
                products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                viewMode="grid"
                                hidePricing={true}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-xl font-semibold mb-2">No products found</h2>
                        <p className="text-muted-foreground mb-4">
                            Try searching for something else or browse our categories
                        </p>
                        <Link href="/products" className="btn btn-primary">
                            Browse All Products
                        </Link>
                    </div>
                )
            ) : (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">
                        Use the search bar above to find products
                    </p>
                </div>
            )}
        </div>
    );
}
