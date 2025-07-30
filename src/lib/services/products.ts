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
      const raw = { ...doc.data(), id: doc.id, };
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

    console.log(`Fetching product with ID: ${id}`);

    const productDocRef = db.collection('products').doc(id);
    const snapshot = await productDocRef.get();

    console.log(`Product snapshot exists: ${snapshot.exists}`);


    if (!snapshot.exists) return null;

    const raw = { ...snapshot.data(), id: snapshot.id, };
    const parsed = ProductSchema.safeParse(raw);

    if (!parsed.success) {
      console.error('Invalid product schema:', parsed.error.format());
      return null;
    }

    console.log(`Product fetched successfully: ${id}`);

    return parsed.data;
  });
}



export async function getFilteredProductsViaCategory(category: string, subcategory: string): Promise<Product[]> {
  const productsRef = db.collection('products') as CollectionReference;
  // the category/subcategory might have haracters like %20... so pares it before checking
  category = decodeURIComponent(category);
  subcategory = decodeURIComponent(subcategory);
  const querySnapshot = await productsRef
    .where('category', '==', category)
    .where('subCategory', '==', subcategory)
    .get();

  const products = querySnapshot.docs.map(doc => {
    const raw = { ...doc.data(), id: doc.id, };
    const parsed = ProductSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn('Invalid product skipped:', parsed.error.format());
      return null;
    }
    return parsed.data;
  });

  return products.filter(Boolean) as Product[];
}

export async function fetchRecommendedProducts(): Promise<Product[]> {
  return retryOperation(async () => {
    const productsCollection = db.collection('products') as CollectionReference;
    // Example: fetch products ordered by a 'popularity' field, descending
    const snapshot = await productsCollection
      .where('isRecommended', '==', true)
      .get();

    const products = snapshot.docs.map(doc => {
      const raw = { ...doc.data(), id: doc.id, };
      const parsed = ProductSchema.safeParse(raw);
      if (!parsed.success) {
        console.warn('Invalid product skipped:', parsed.error.format());
        return null;
      }
      return parsed.data;
    });
    return products.filter(Boolean) as Product[];
  });
}