import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { ProductSchema, type Product } from '@/lib/models/Product';
import { z } from 'zod';
import { CollectionReference } from 'firebase-admin/firestore';
import { createQueryBuilder } from '@/lib/server/firestore-query-builder';
import { cleanupProductImages } from '@/lib/utils/firebaseStorage';

/**
 * Admin-only API endpoint for product management.
 * 
 * **Security:**
 * - Requires valid admin session cookie
 * - Validates all input data with Zod schemas
 * - Server-side only using Firebase Admin SDK
 * 
 * **Operations:**
 * - GET: Fetch products with pagination and filtering
 * - POST: Create new product
 * - PUT: Update existing product
 * - DELETE: Delete product
 */

// Middleware to verify admin authentication
async function verifyAdminAuth(req: NextRequest) {
    const sessionCookie = req.cookies.get('session')?.value;

    if (!sessionCookie) {
        return false;
    }

    try {
        const sessionData = JSON.parse(sessionCookie);
        return sessionData.role === 'admin';
    } catch {
        return false;
    }
}

// Schema for product filtering and infinite scroll (simplified without sort options)
const AdminProductFilterSchema = z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    subCategory: z.string().optional(),
    brand: z.string().optional(),
    pageSize: z.coerce.number().min(1).max(50).default(24),
    startAfterId: z.string().optional(),
});

/**
 * Response format for infinite scroll admin queries
 */
interface AdminInfiniteScrollResponse {
    products: Product[];
    hasMore: boolean;
    lastProductId?: string;
}/**
 * GET /api/admin/products
 * Fetch products with infinite scroll pagination and filtering for admin panel
 */
export async function GET(req: NextRequest) {
    // Verify admin authentication
    const isAuthorized = await verifyAdminAuth(req);
    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const filters = AdminProductFilterSchema.parse({
            search: searchParams.get('search') || undefined,
            category: searchParams.get('category') || undefined,
            subCategory: searchParams.get('subCategory') || undefined,
            brand: searchParams.get('brand') || undefined,
            pageSize: searchParams.get('pageSize') || '24',
            startAfterId: searchParams.get('startAfterId') || undefined,
        });

        const productsRef = adminDb.collection('products') as CollectionReference;

        // Use query builder pattern like client-side implementation
        const queryBuilder = createQueryBuilder<Product>(productsRef);

        // Apply category filter
        if (filters.category) {
            queryBuilder.where('category', '==', filters.category);
        }

        // Apply subcategory filter
        if (filters.subCategory) {
            queryBuilder.where('subCategory', '==', filters.subCategory);
        }

        // Apply brand filter
        if (filters.brand) {
            queryBuilder.where('brand', '==', filters.brand);
        }

        // Apply search filter using Firestore's range query
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            queryBuilder
                .where('name', '>=', searchTerm)
                .where('name', '<=', searchTerm + '\uf8ff');
        }

        // Default sort by createdAt descending to show latest items first
        queryBuilder.orderBy('createdAt', 'desc');

        // Apply cursor pagination
        if (filters.startAfterId) {
            const startAfterDoc = await productsRef.doc(filters.startAfterId).get();
            if (startAfterDoc.exists) {
                queryBuilder.startAfter(startAfterDoc);
            }
        }

        // Fetch one more than pageSize to check if there are more results
        queryBuilder.limit(filters.pageSize + 1);

        // Execute the query using the builder
        const query = queryBuilder.build();
        const snapshot = await query.get();
        const allProducts = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));

        // Check if there are more results
        const hasMore = allProducts.length > filters.pageSize;
        const products = hasMore ? allProducts.slice(0, -1) : allProducts;

        // Get the last product ID for next page cursor
        const lastProductId = products.length > 0 ? products[products.length - 1].id : undefined;

        // Validate products with schema
        const validatedProducts = products.map(product => ProductSchema.parse(product));

        const response: AdminInfiniteScrollResponse = {
            products: validatedProducts,
            hasMore,
            lastProductId,
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching admin products:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Invalid parameters',
                details: error.errors
            }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST: Create new product
 */
export async function POST(req: NextRequest) {
    if (!await verifyAdminAuth(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Create schema for product creation (without id field)
        const CreateProductSchema = z.object({
            name: z.string(),
            category: z.string(),
            subCategory: z.string(),
            brand: z.string().optional(),
            price: z.number().optional(),
            actualPrice: z.number(),
            discountPercentage: z.number().nullable().optional(),
            rating: z.number(),
            shortDescription: z.string().optional(),
            details: z.string().optional(),
            image: z.string().optional(),
            images: z.array(z.string()).optional(),
            inventory: z.number().default(1),
            isRecommended: z.boolean().default(false),
        });

        // Validate product data (without id since it will be auto-generated)
        const validatedProduct = CreateProductSchema.parse(body);

        // Add to Firestore
        const docRef = await adminDb.collection('products').add({
            ...validatedProduct,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const newProduct = { ...validatedProduct, id: docRef.id };

        return NextResponse.json({
            message: 'Product created successfully',
            product: newProduct,
            id: docRef.id
        }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Validation failed',
                details: error.errors
            }, { status: 400 });
        }

        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

/**
 * PUT: Update existing product
 */
export async function PUT(req: NextRequest) {
    if (!await verifyAdminAuth(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        // Validate product data
        const validatedProduct = ProductSchema.parse({ id, ...updateData });

        // Update in Firestore
        await adminDb.collection('products').doc(id).update({
            ...validatedProduct,
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({
            message: 'Product updated successfully',
            product: validatedProduct
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Validation failed',
                details: error.errors
            }, { status: 400 });
        }

        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

/**
 * DELETE: Delete product
 */
export async function DELETE(req: NextRequest) {
    if (!await verifyAdminAuth(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        // Check if product exists
        const doc = await adminDb.collection('products').doc(id).get();
        if (!doc.exists) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Delete all product images from Firebase Storage
        try {
            await cleanupProductImages(id);
            console.log('Successfully cleaned up images for product:', id);
        } catch (error) {
            console.error('Error cleaning up product images:', error);
            // Continue with product deletion even if image cleanup fails
        }

        // Delete from Firestore
        await adminDb.collection('products').doc(id).delete();

        return NextResponse.json({ message: 'Product deleted successfully' });

    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}