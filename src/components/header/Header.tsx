import HeaderClient from './HeaderClient';
import { getSubcategoriesFromDB } from '@/lib/services/categories';

export default async function Header() {
    const categories = await getSubcategoriesFromDB();
    return <HeaderClient categories={categories} />;
}
