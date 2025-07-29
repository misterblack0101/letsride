// components/RecommendedProducts.tsx
import { fetchRecommendedProducts } from '@/lib/services/products';
import ClientRecommendedProducts from './ClientRecommendedProducts';

export default async function RecommendedProducts() {
    const products = await fetchRecommendedProducts(); // runs on server
    return <ClientRecommendedProducts products={products} />;
}
