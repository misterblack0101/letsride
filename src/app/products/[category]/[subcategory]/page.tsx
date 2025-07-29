// app/products/category/[category]/[subcategory]/page.tsx
import { getFilteredProductsViaCategory } from '@/lib/services/products'; // <- you write this
import ClientProducts from '../../ClientProducts';

type Props = {
    params: {
        category: string;
        subcategory: string;
    };
};

export default async function CategoryPage({ params }: Props) {
    const { category, subcategory } = await params;

    const products = await getFilteredProductsViaCategory(category, subcategory);


    return <ClientProducts initialProducts={products} />;
}
