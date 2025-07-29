import ProductDetails from "@/components/ProductDetails";
import { getProductById } from "@/lib/services/products";
import { notFound } from "next/navigation";


export default async function ProductPage({ params }: { params: { id: string } }) {
  // Await the params object before accessing its properties
  const { id } = await params;

  // Fetch the specific product based on the ID from the URL
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}