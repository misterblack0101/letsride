import { fetchProducts } from '@/lib/services/products';
import ClientProducts from './ClientProducts';

export default async function StorePage() {
  // Fetch products on the server side
  const products = await fetchProducts();

  return <ClientProducts initialProducts={products} />;
}