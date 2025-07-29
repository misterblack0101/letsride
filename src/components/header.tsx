import HeaderContent from './header-content';
import { getSubcategoriesFromDB } from '@/lib/services/categories';

export default async function Header() {
    const categories = await getSubcategoriesFromDB();
    return <HeaderContent categories={categories} />;
}
