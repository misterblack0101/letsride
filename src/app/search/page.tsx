import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import type { Product } from '@/lib/models/Product';
import ProductCard from '@/components/products/ProductCard';
import { getProductSlug } from '@/lib/utils/slugify';
import { searchProducts } from '@/lib/services/search';

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

const baseBrandLogoUrl = 'https://firebasestorage.googleapis.com/v0/b/letsridecycles.firebasestorage.app/o/brandLogos';

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
        // roundedDiscountPercentage expected by Product type/schema; compute if possible
        roundedDiscountPercentage: result.discountedPrice != null
            ? Math.round(((result.price - (result.discountedPrice || result.price)) / result.price) * 100)
            : null,
        actualPrice: result.price,
        rating: result.rating,
        images: result.imageUrl ? [result.imageUrl] : ['/images/placeholder.jpg'],
        brandLogo: result.brand
            ? `${baseBrandLogoUrl}%2F${result.brand.toLowerCase().replace(/\s+/g, '-')}.png?alt=media`
            : `${baseBrandLogoUrl}%2Fdefault.png?alt=media`,
        inventory: 1, // Assume in stock for search results
        isRecommended: false,
        shortDescription: '',
        details: '',
        tags: [],
        slug: getProductSlug(result.name),
    }));
}

async function searchProductsViaAPI(query: string, limit: number = 50): Promise<Product[]> {
    try {
        // Use server-side search function directly to avoid server fetch of internal API routes
        const results = await searchProducts(query, limit);
        if (!results || results.length === 0) return [];

        // Normalize results so downstream components always have slug, images, brandLogo, etc.
        return results.map((p) => {
            const images = (p.images || []).filter(Boolean).filter((img) => typeof img === 'string' && img.trim() !== '');
            const imageUrl = (p.image && p.image.trim() !== '' ? p.image : images.length > 0 ? images[0] : '/images/placeholder.jpg');

            const roundedDiscountPercentage = p.roundedDiscountPercentage != null
                ? p.roundedDiscountPercentage
                : (p.discountPercentage != null ? Math.round(p.discountPercentage) : null);

            const baseBrandLogoUrl = 'https://firebasestorage.googleapis.com/v0/b/letsridecycles.firebasestorage.app/o/brandLogos';
            const brandLogo = p.brand
                ? `${baseBrandLogoUrl}%2F${p.brand.toLowerCase().replace(/\s+/g, '-')}.png?alt=media`
                : `${baseBrandLogoUrl}%2Fdefault.png?alt=media`;

            return {
                ...p,
                images: images.length > 0 ? images : [imageUrl],
                image: imageUrl,
                slug: p.slug || getProductSlug(p.name || ''),
                roundedDiscountPercentage,
                brandLogo,
                discountedPrice: p.discountedPrice != null ? p.discountedPrice : (p.price != null ? p.price : p.actualPrice),
            } as Product;
        });
    } catch (error) {
        console.error('Search service error:', error);
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
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
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
