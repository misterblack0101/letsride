import { fetchProducts } from '@/lib/services/products';
import ClientProducts from './ClientProducts';

export default async function StorePage() {
  // Page loads instantly, products are fetched on the client side
  const products = await fetchProducts();
  return <ClientProducts initialProducts={products} />;
}