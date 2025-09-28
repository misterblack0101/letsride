import HeaderClient from './HeaderClient';
import { getCategoriesFromDB } from '@/lib/services/categories';

export default async function Header() {
    const { subcategoriesByCategory, brandsBySubcategory } = await getCategoriesFromDB();
    return <HeaderClient categoriesData={{ subcategoriesByCategory, brandsBySubcategory }} />;
}
