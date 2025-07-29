import { adminDb as db } from '../firebase/admin';
import { CollectionReference } from 'firebase-admin/firestore';
import { ProductSchema, Product } from '../models/Product';

// Retry helper function
async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
      console.log(`Retrying operation, attempt ${attempt + 1}/${maxRetries}`);
    }
  }
  throw new Error('Max retries exceeded');
}

// Fetch all products
// 🔄 Fetch all products from the Firestore 'products' collection
export async function fetchProducts(): Promise<Product[]> {
  return retryOperation(async () => {
    const productsCollection = db.collection('products') as CollectionReference;
    // const productsCollection = collection(db, 'products');
    // Retrieve all documents from the 'products' collection
    const productDocs = await productsCollection.get();

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
  });
}

// 🔍 Fetch a single product by ID (from Firestore)
export async function getProductById(id: string): Promise<Product | null> {
  return retryOperation(async () => {

    const productDocRef = db.collection('products').doc(id);
    const snapshot = await productDocRef.get();

    if (!snapshot.exists) return null;

    const raw = { id: snapshot.id, ...snapshot.data() };
    const parsed = ProductSchema.safeParse(raw);

    if (!parsed.success) {
      console.error('Invalid product schema:', parsed.error.format());
      return null;
    }

    return parsed.data;
  });
}



export async function getFilteredProductsViaCategory(category: string, subcategory: string): Promise<Product[]> {
  const allDocs = await db.collection('products').get();
  const allProducts = allDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return allProducts.filter((product: any) =>
    product.category === category && product.subcategory === subcategory
  ) as Product[];
}