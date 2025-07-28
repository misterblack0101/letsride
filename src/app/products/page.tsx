import { fetchProducts } from '@/lib/services/products';
import ProductsClient from './products-client';

export default async function StorePage() {
  // Fetch products on the server side
  const products = await fetchProducts();

  return <ProductsClient initialProducts={products} />;
}