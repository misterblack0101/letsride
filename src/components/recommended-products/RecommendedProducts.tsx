// components/RecommendedProducts.tsx
import { fetchRecommendedProducts } from '@/lib/server/products.server';
import ClientRecommendedProducts from './ClientRecommendedProducts';

export default async function RecommendedProducts() {
    const products = await fetchRecommendedProducts(); // runs on server
    return <ClientRecommendedProducts products={products} />;
}
