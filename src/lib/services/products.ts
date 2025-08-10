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

// Filter options interface
export interface ProductFilterOptions {
  categories?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price_low' | 'price_high' | 'rating' | 'popularity';
}

// Enhanced fetch function with server-side filtering
export async function fetchFilteredProducts(filters: ProductFilterOptions = {}): Promise<Product[]> {
  return retryOperation(async () => {
    const productsCollection = db.collection('products') as CollectionReference;
    let query: any = productsCollection;

    // Apply Firestore filters where possible
    if (filters.categories && filters.categories.length === 1) {
      // Firestore can only filter by one category at a time efficiently
      query = query.where('category', '==', filters.categories[0]);
    }

    if (filters.brands && filters.brands.length === 1) {
      // Firestore can only filter by one brand at a time efficiently
      query = query.where('brand', '==', filters.brands[0]);
    }

    // Get documents
    const productDocs = await query.get();

    // Map and validate documents
    const products = productDocs.docs.map((doc: any) => {
      const raw = { ...doc.data(), id: doc.id };
      const parsed = ProductSchema.safeParse(raw);
      if (!parsed.success) {
        console.warn('Invalid product skipped:', parsed.error.format());
        return null;
      }
      return parsed.data;
    }).filter(Boolean) as Product[];

    // Apply client-side filters for complex filtering
    let filteredProducts = products;

    // Filter by multiple categories (if more than one)
    if (filters.categories && filters.categories.length > 1) {
      filteredProducts = filteredProducts.filter(p =>
        filters.categories!.includes(p.category)
      );
    }

    // Filter by multiple brands (if more than one)
    if (filters.brands && filters.brands.length > 1) {
      filteredProducts = filteredProducts.filter(p =>
        p.brand && filters.brands!.includes(p.brand)
      );
    }

    // Filter by price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const minPrice = filters.minPrice ?? 0;
      const maxPrice = filters.maxPrice ?? Number.MAX_SAFE_INTEGER;
      filteredProducts = filteredProducts.filter(p =>
        p.price >= minPrice && p.price <= maxPrice
      );
    }

    // Sort products
    if (filters.sortBy) {
      filteredProducts.sort((a, b) => {
        switch (filters.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price_low':
            return a.price - b.price;
          case 'price_high':
            return b.price - a.price;
          case 'rating':
            return b.rating - a.rating;
          case 'popularity':
          default:
            return b.rating - a.rating; // Using rating as popularity proxy
        }
      });
    }

    return filteredProducts;
  });
}

// Fetch all products (kept for backward compatibility)
export async function fetchProducts(): Promise<Product[]> {
  return fetchFilteredProducts();
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