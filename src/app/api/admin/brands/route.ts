import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { z } from 'zod';
import { deleteBrandLogo } from '@/lib/utils/firebaseStorage';

/**
 * Admin-only API endpoint for brand management.
 * 
 * **Security:**
 * - Requires valid admin session cookie
 * - Validates all input data with Zod schemas
 * - Server-side only using Firebase Admin SDK
 * 
 * **Operations:**
 * - GET: Fetch all brands from the categories structure
 * - PUT: Update brand information in categories
 */

// Brand schema for validation
const BrandSchema = z.object({
    name: z.string().min(1, 'Brand name is required'),
    category: z.string().min(1, 'Category is required'),
    subcategory: z.string().min(1, 'Subcategory is required'),
});

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

/**
 * GET: Fetch all brands organized by category and subcategory
 */
export async function GET(req: NextRequest) {
    if (!await verifyAdminAuth(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const categoriesDoc = await adminDb.collection('categories').doc('all').get();

        if (!categoriesDoc.exists) {
            return NextResponse.json({ error: 'Categories not found' }, { status: 404 });
        }

        const categoriesData = categoriesDoc.data() || {};

        // Extract all brands with their category and subcategory info
        const brandsList: Array<{
            name: string;
            category: string;
            subcategory: string;
        }> = [];

        Object.entries(categoriesData).forEach(([categoryName, categoryData]: [string, any]) => {
            if (categoryData.subcategories) {
                Object.entries(categoryData.subcategories).forEach(([subcategoryName, subcategoryData]: [string, any]) => {
                    if (subcategoryData.brands && Array.isArray(subcategoryData.brands)) {
                        subcategoryData.brands.forEach((brandName: string) => {
                            brandsList.push({
                                name: brandName,
                                category: categoryName,
                                subcategory: subcategoryName,
                            });
                        });
                    }
                });
            }
        });

        // Get unique brands
        const uniqueBrands = Array.from(
            new Map(brandsList.map(brand => [brand.name, brand])).values()
        );

        return NextResponse.json({
            brands: brandsList,
            uniqueBrands,
            categoriesStructure: categoriesData,
        });

    } catch (error) {
        console.error('Error fetching brands:', error);
        return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
    }
}

/**
 * POST: Add a new brand to a category/subcategory
 */
export async function POST(req: NextRequest) {
    if (!await verifyAdminAuth(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedBrand = BrandSchema.parse(body);

        const categoriesDocRef = adminDb.collection('categories').doc('all');
        const categoriesDoc = await categoriesDocRef.get();

        if (!categoriesDoc.exists) {
            return NextResponse.json({ error: 'Categories document not found' }, { status: 404 });
        }

        const categoriesData = categoriesDoc.data() || {};

        // Check if category and subcategory exist
        if (!categoriesData[validatedBrand.category]) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        if (!categoriesData[validatedBrand.category].subcategories[validatedBrand.subcategory]) {
            return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
        }

        // Get existing brands for this subcategory
        const existingBrands = categoriesData[validatedBrand.category]
            .subcategories[validatedBrand.subcategory].brands || [];

        // Check if brand already exists
        if (existingBrands.includes(validatedBrand.name)) {
            return NextResponse.json({ error: 'Brand already exists in this subcategory' }, { status: 400 });
        }

        // Add the new brand
        existingBrands.push(validatedBrand.name);
        existingBrands.sort(); // Keep brands sorted

        // Update the categories document
        await categoriesDocRef.update({
            [`${validatedBrand.category}.subcategories.${validatedBrand.subcategory}.brands`]: existingBrands
        });

        return NextResponse.json({
            message: 'Brand added successfully',
            brand: validatedBrand
        }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Validation failed',
                details: error.errors
            }, { status: 400 });
        }

        console.error('Error adding brand:', error);
        return NextResponse.json({ error: 'Failed to add brand' }, { status: 500 });
    }
}

/**
 * DELETE: Remove a brand from a category/subcategory
 */
export async function DELETE(req: NextRequest) {
    if (!await verifyAdminAuth(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        const brandName = url.searchParams.get('name');
        const category = url.searchParams.get('category');
        const subcategory = url.searchParams.get('subcategory');

        if (!brandName || !category || !subcategory) {
            return NextResponse.json({
                error: 'Brand name, category, and subcategory are required'
            }, { status: 400 });
        }

        const categoriesDocRef = adminDb.collection('categories').doc('all');
        const categoriesDoc = await categoriesDocRef.get();

        if (!categoriesDoc.exists) {
            return NextResponse.json({ error: 'Categories document not found' }, { status: 404 });
        }

        const categoriesData = categoriesDoc.data() || {};

        // Check if category and subcategory exist
        if (!categoriesData[category]?.subcategories[subcategory]) {
            return NextResponse.json({ error: 'Category or subcategory not found' }, { status: 404 });
        }

        // Get existing brands for this subcategory
        const existingBrands = categoriesData[category]
            .subcategories[subcategory].brands || [];

        // Check if brand exists
        const brandIndex = existingBrands.indexOf(brandName);
        if (brandIndex === -1) {
            return NextResponse.json({ error: 'Brand not found in this subcategory' }, { status: 404 });
        }

        // Remove the brand
        existingBrands.splice(brandIndex, 1);

        // Delete brand logo from Firebase Storage
        try {
            await deleteBrandLogo(brandName);
            console.log('Successfully deleted brand logo for:', brandName);
        } catch (error) {
            console.error('Error deleting brand logo:', error);
            // Continue with brand deletion even if logo deletion fails
        }

        // Update the categories document
        await categoriesDocRef.update({
            [`${category}.subcategories.${subcategory}.brands`]: existingBrands
        });

        return NextResponse.json({ message: 'Brand removed successfully' });

    } catch (error) {
        console.error('Error removing brand:', error);
        return NextResponse.json({ error: 'Failed to remove brand' }, { status: 500 });
    }
}