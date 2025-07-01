import { notFound } from 'next/navigation';
import { products } from '@/lib/data';
import ProductDetails from '@/components/product-details';

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }))
}

export default function ProductPage({ params }: { params: { id:string } }) {
  const { id } = params;
  const product = products.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}
