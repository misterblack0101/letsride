import { searchProducts } from '@/lib/services/search';
import ProductGrid from '@/components/products/ProductGrid';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

interface SearchPageProps {
    searchParams: Promise<{ q?: string }>;
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

    const products = query ? await searchProducts(query, 50) : [];

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
                            Found {products.length} product{products.length !== 1 ? 's' : ''}
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
                    <ProductGrid products={products} viewMode="grid" />
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
