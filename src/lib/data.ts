import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Product } from "./types";

export async function fetchProducts(): Promise<Product[]> {
  const productsCollection = collection(db, 'products');
  const productDocs = await getDocs(productsCollection);
  const data = productDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return data as Product[];
}

export const products: Product[] = await fetchProducts();


export const brands = [...new Set(products.map(p => p.brand))];
export const types = [...new Set(products.map(p => p.type))];