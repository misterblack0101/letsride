import { db } from '../firebase/server';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { ProductSchema, Product } from '../models/Product';

// Fetch all products
// 🔄 Fetch all products from the Firestore 'products' collection
export async function fetchProducts(): Promise<Product[]> {
  const productsCollection = collection(db, 'products');
  // Retrieve all documents from the 'products' collection
  const productDocs = await getDocs(productsCollection);

  // Map over each document and validate its data
  const data = productDocs.docs.map(doc => {
    const raw = { id: doc.id, ...doc.data() };
    // Validate the raw data against the ProductSchema
    const parsed = ProductSchema.safeParse(raw);
    if (!parsed.success) {
      // If validation fails, log a warning and skip this product
      console.warn('Invalid product skipped:', parsed.error.format());
      return null;
    }
    // If valid, return the parsed product data
    return parsed.data;
  });

  // Filter out any invalid (null) products and return the valid ones
  return data.filter(Boolean) as Product[];
}

// 🔍 Fetch a single product by ID (from Firestore)
export async function getProductById(id: string): Promise<Product | null> {
  const productDocRef = doc(db, 'products', id);
  const snapshot = await getDoc(productDocRef);

  if (!snapshot.exists()) return null;

  const raw = { id: snapshot.id, ...snapshot.data() };
  const parsed = ProductSchema.safeParse(raw);

  if (!parsed.success) {
    console.error('Invalid product schema:', parsed.error.format());
    return null;
  }

  return parsed.data;
}

// Optional: prefetch for global filters (used rarely)
const allProducts = await fetchProducts();
export const brands = [...new Set(allProducts.map(p => p.brand))];
export const types = [...new Set(allProducts.map(p => p.type))];
