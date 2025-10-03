import ProductDetailsClient from "@/components/products/ProductDetailsClient";
import { getProductBySlug } from "@/lib/server/products.server";
import { notFound } from "next/navigation";
import { getProductSlug } from "@/lib/utils/slugify";

export default async function ProductPage({ params }: { params: { name: string } }) {
    // Await the params object before accessing its properties
    const { name } = await params;
    // Slugify the name param to ensure safe lookup
    const slug = getProductSlug(name);
    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    return <ProductDetailsClient product={product} />;
}
