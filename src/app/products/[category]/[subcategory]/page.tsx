// app/products/category/[category]/[subcategory]/page.tsx
import { getFilteredProductsViaCategory } from '@/lib/services/products'; // <- you write this
import ProductCard from '@/components/product-card';

type Props = {
    params: {
        category: string;
        subcategory: string;
    };
};

export default async function CategoryPage({ params }: Props) {
    const { category, subcategory } = await params;

    const products = await getFilteredProductsViaCategory(category, subcategory);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">
                {subcategory} in {category}
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((prod) => (
                    <h1 className="text-lg font-semibold mb-2" >
                        {prod.name}
                    </h1>
                    //   <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </div>
    );
}
