'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import {
    Save,
    X,
    Upload,
    Trash2,
    Plus,
    ArrowLeft,
    AlertCircle
} from 'lucide-react';
import { z } from 'zod';
import {
    uploadProductImages,
    uploadThumbnail,
    deleteProductImage,
    UPLOAD_CONFIG
} from '@/lib/utils/firebaseStorage';
import {
    validateImageFile,
    formatFileSize,
    getCompressionPreview
} from '@/lib/utils/imageCompression';

/**
 * Product Form Component for Admin Panel.
 * 
 * **Features:**
 * - Comprehensive form validation with Zod schema
 * - Real-time image upload with preview
 * - Dynamic category and brand selection
 * - Auto-calculation of discounted prices
 * - Responsive design with intuitive UX
 * 
 * **Validation:**
 * - Required field validation
 * - Price and rating constraints
 * - Image file type and size validation
 * - Form state management with error handling
 */

interface Product {
    id?: string;
    name: string;
    category: string;
    subCategory: string;
    brand?: string;
    price?: number;
    actualPrice: number;
    discountPercentage?: number | null;
    rating: number;
    shortDescription?: string;
    details?: string;
    images?: string[];
    image?: string; // Thumbnail image URL
    inventory: number;
    isRecommended: boolean;
}

interface ProductFormProps {
    product?: Product | null;
    onSuccess: () => void;
    onCancel: () => void;
}

// Form validation schema - matches API creation schema
const ProductFormSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    category: z.string().min(1, 'Category is required'),
    subCategory: z.string().min(1, 'Subcategory is required'),
    brand: z.string().min(1, 'Brand is required'),
    price: z.number().min(0, 'Price must be non-negative').optional(),
    actualPrice: z.number().min(0, 'Actual price must be non-negative'),
    discountPercentage: z.number().min(0).max(100).nullable().optional(),
    rating: z.number().min(0).max(5, 'Rating must be between 0 and 5'),
    shortDescription: z.string().optional(),
    details: z.string().optional(),
    images: z.array(z.string()).optional(), // Made optional - will be validated at submission
    image: z.string().optional(), // Made optional - will be validated at submission
    inventory: z.number().min(0, 'Inventory must be non-negative'),
    isRecommended: z.boolean(),
});

type FormData = z.infer<typeof ProductFormSchema>;

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
    const { toast } = useToast();
    const { getIdToken } = useAuth();

    const [formData, setFormData] = useState<FormData>({
        name: '',
        category: '',
        subCategory: '',
        brand: '',
        price: 0,
        actualPrice: 0,
        discountPercentage: null,
        rating: 4.5,
        shortDescription: '',
        details: '',
        inventory: 1,
        isRecommended: false,
        images: [],
        image: '', // Thumbnail URL
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [operationType, setOperationType] = useState<'saving' | 'deleting'>('saving');

    // Dynamic category data state
    const [categoryData, setCategoryData] = useState<{
        categories: Record<string, any>;
        subcategoriesByCategory: Record<string, string[]>;
        brandsBySubcategory: Record<string, Record<string, string[]>>;
        allBrands: string[];
        brandsByCategory: Record<string, string[]>;
    }>({
        categories: {},
        subcategoriesByCategory: {},
        brandsBySubcategory: {},
        allBrands: [],
        brandsByCategory: {}
    });

    // Remove the old dynamic brands state as it's now part of categoryData
    const [dataLoading, setDataLoading] = useState(false);
    const hasFetchedData = useRef(false);

    // Fetch all category data from API
    const fetchCategoryData = async () => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        setDataLoading(true);
        try {
            const response = await fetch('/api/admin/categories', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch category data');
            }

            const result = await response.json();
            setCategoryData(result.data);
        } catch (error) {
            console.error('Error fetching category data:', error);
            // Provide empty fallback structure
            setCategoryData({
                categories: {},
                subcategoriesByCategory: {},
                brandsBySubcategory: {},
                allBrands: [],
                brandsByCategory: {}
            });
        } finally {
            setDataLoading(false);
        }
    };

    // Initialize form with existing product data
    useEffect(() => {
        fetchCategoryData(); // Fetch category data on component mount

        if (product) {
            setFormData({
                name: product.name,
                category: product.category,
                subCategory: product.subCategory,
                brand: product.brand || '',
                price: product.price || 0,
                actualPrice: product.actualPrice || 0,
                discountPercentage: product.discountPercentage,
                rating: product.rating,
                shortDescription: product.shortDescription || '',
                details: product.details || '',
                images: product.images || [],
                image: product.image || '', // Thumbnail
                inventory: product.inventory,
                isRecommended: product.isRecommended,
            });
        }
    }, [product]);    // Handle form field changes
    const handleChange = (field: keyof FormData, value: any) => {
        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        setFormData(prev => {
            // Helper to round numbers to 2 decimal places
            const round2 = (n: number) => Math.round(n * 100) / 100;

            // Normalize inputs for price and discount to at most 2 decimal places
            if (field === 'price' && typeof value === 'number') {
                value = round2(value);
            }

            if (field === 'discountPercentage' && typeof value === 'number') {
                value = round2(value);
            }

            const updated = { ...prev, [field]: value };

            // Reset dependent fields when category or subcategory changes
            if (field === 'category') {
                // Reset subcategory and brand when category changes
                updated.subCategory = '';
                updated.brand = '';
            } else if (field === 'subCategory') {
                // Reset brand when subcategory changes
                updated.brand = '';
            }

            // Auto-calculate discount/price when one changes
            if (field === 'price' && value && updated.actualPrice) {
                // Calculate discount percentage from selling price (round to 2 decimals)
                const discount = ((updated.actualPrice - value) / updated.actualPrice) * 100;
                updated.discountPercentage = discount > 0 ? round2(discount) : 0;
            } else if (field === 'discountPercentage' && value !== null && updated.actualPrice) {
                // Calculate selling price from discount percentage (round to 2 decimals)
                updated.price = round2(updated.actualPrice * (1 - value / 100));
            } else if (field === 'actualPrice' && value) {
                // Recalculate based on existing discount or price
                if (updated.discountPercentage && updated.discountPercentage > 0) {
                    updated.price = round2(value * (1 - updated.discountPercentage / 100));
                } else if (updated.price && updated.price > 0) {
                    const discount = ((value - updated.price) / value) * 100;
                    updated.discountPercentage = discount > 0 ? round2(discount) : 0;
                }
            }

            return updated;
        });
    };    // Prevent form submission on Enter key
    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === 'Enter' && e.target !== e.currentTarget) {
            e.preventDefault();
        }
    };

    // Handle product deletion
    const handleDelete = async () => {
        if (!product?.id) {
            toast({
                title: "Error",
                description: "Cannot delete a product that hasn't been created yet",
                variant: "destructive",
            });
            return;
        }

        // Show confirmation dialog
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"?\n\nThis action cannot be undone and will permanently remove the product and all its images.`
        );

        if (!confirmed) return;

        setOperationType('deleting');
        setLoading(true);

        try {
            const token = await getIdToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch(`/api/admin/products?id=${product.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete product');
            }

            toast({
                title: "Success!",
                description: "Product deleted successfully",
                variant: "success",
            });

            onSuccess(); // Navigate back to product list

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
            toast({
                title: "Delete Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle main images selection (not upload yet)
    const handleImageFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        try {
            // Validate files
            const validFiles: File[] = [];
            for (const file of Array.from(files)) {
                validateImageFile(file);
                validFiles.push(file);
            }

            // Check total image count
            const totalImages = (formData.images?.length || 0) + validFiles.length;
            if (totalImages > UPLOAD_CONFIG.MAX_IMAGES) {
                throw new Error(`Maximum ${UPLOAD_CONFIG.MAX_IMAGES} images allowed`);
            }

            setSelectedFiles(prev => [...prev, ...validFiles]);

            // Clear any previous errors
            setErrors(prev => ({ ...prev, images: '' }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to select images';
            toast({
                title: "Image Selection Error",
                description: errorMessage,
                variant: "destructive",
            });
            setErrors(prev => ({
                ...prev,
                images: errorMessage
            }));
        }
    };

    // Handle thumbnail file selection (not upload yet)
    const handleThumbnailFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        try {
            const file = files[0]; // Only take the first file for thumbnail
            validateImageFile(file);
            setThumbnailFile(file);
            setErrors(prev => ({ ...prev, image: '' }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to select thumbnail';
            toast({
                title: "Thumbnail Selection Error",
                description: errorMessage,
                variant: "destructive",
            });
            setErrors(prev => ({
                ...prev,
                image: errorMessage
            }));
        }
    };

    // Remove selected thumbnail before upload
    const handleRemoveSelectedThumbnail = () => {
        setThumbnailFile(null);
    };

    // Remove selected file before upload
    const handleRemoveSelectedFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Remove uploaded image
    const handleRemoveUploadedImage = async (index: number) => {
        const imageToDelete = formData.images?.[index];
        if (imageToDelete) {
            // Delete from Firebase Storage
            await deleteProductImage(imageToDelete);
        }

        // Remove from form data
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index) || [],
        }));
    };

    // Upload all images and thumbnail
    const uploadAllImages = async (productId: string) => {
        const promises: Promise<any>[] = [];

        // Upload main images if selected
        if (selectedFiles.length > 0) {
            const imageUploadPromise = uploadProductImages(
                selectedFiles,
                productId,
                setUploadProgress
            ).then(urls => {
                setFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...urls],
                }));
                setSelectedFiles([]);
            });
            promises.push(imageUploadPromise);
        }

        // Upload thumbnail if selected
        if (thumbnailFile) {
            const thumbnailUploadPromise = uploadThumbnail(thumbnailFile, productId)
                .then(url => {
                    setFormData(prev => ({ ...prev, image: url }));
                    setThumbnailFile(null);
                });
            promises.push(thumbnailUploadPromise);
        }

        await Promise.all(promises);
    };

    // Validate form
    const validateForm = (): boolean => {
        try {
            ProductFormSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                error.errors.forEach(err => {
                    if (err.path.length > 0) {
                        newErrors[err.path[0]] = err.message;
                    }
                });

                // Show validation error toast
                toast({
                    title: "Form Validation Error",
                    description: "Please fix the errors below and try again",
                    variant: "destructive",
                });

                setErrors(newErrors);
            }
            return false;
        }
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if we have pending images to upload
        const hasNewImages = selectedFiles.length > 0 || !!thumbnailFile;
        const hasExistingImages = (formData.images?.length || 0) > 0;
        const hasExistingThumbnail = !!formData.image;

        // Validate minimum image requirements
        if (!hasNewImages && !hasExistingImages) {
            toast({
                title: "Validation Error",
                description: "At least one image is required",
                variant: "destructive",
            });
            setErrors(prev => ({ ...prev, images: 'At least one image is required' }));
            return;
        }

        if (!thumbnailFile && !hasExistingThumbnail) {
            toast({
                title: "Validation Error",
                description: "Thumbnail image is required",
                variant: "destructive",
            });
            setErrors(prev => ({ ...prev, image: 'Thumbnail image is required' }));
            return;
        }

        setOperationType('saving');
        setLoading(true);

        try {
            let productId = product?.id;
            let isNewProduct = !productId;
            let finalFormData = { ...formData }; // Track the final form data

            // Validate form data before processing
            try {
                ProductFormSchema.parse(formData);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const newErrors: Record<string, string> = {};
                    const errorDetails: string[] = [];

                    error.errors.forEach(err => {
                        const field = err.path[0] as string;
                        const message = err.message;
                        if (field) {
                            newErrors[field] = message;
                            errorDetails.push(`${field}: ${message}`);
                        }
                    });

                    // Show detailed validation error toast
                    toast({
                        title: "Validation Failed",
                        description: `Please fix the following errors: ${errorDetails.join(', ')}`,
                        variant: "destructive",
                    });

                    setErrors(newErrors);
                    return;
                }
                throw error;
            }            // Step 1: Save product data first (without images for new products)
            if (isNewProduct) {
                // For new products, create product record first to get real ID
                const tempProductData = {
                    ...formData,
                    images: [], // Empty for now
                    image: '', // Empty for now
                };

                const token = await getIdToken();
                if (!token) {
                    throw new Error('No authentication token available');
                }

                const response = await fetch('/api/admin/products', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(tempProductData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API error:', errorData);
                    throw new Error(errorData.error || 'Failed to create product');
                }

                const result = await response.json();
                productId = result.id; // Get the real product ID from API
            }

            // Step 2: Upload images using the real product ID
            if (hasNewImages && productId) {
                setUploadingImages(true);

                // Upload images and get the URLs directly
                const uploadPromises: Promise<any>[] = [];
                let newImageUrls: string[] = [];
                let newThumbnailUrl: string = '';

                // Upload main images if selected
                if (selectedFiles.length > 0) {
                    const imageUploadPromise = uploadProductImages(
                        selectedFiles,
                        productId,
                        setUploadProgress
                    ).then(urls => {
                        newImageUrls = urls;
                    });
                    uploadPromises.push(imageUploadPromise);
                }

                // Upload thumbnail if selected
                if (thumbnailFile) {
                    // Note: Firebase Storage will automatically overwrite existing thumbnail.webp
                    const thumbnailUploadPromise = uploadThumbnail(thumbnailFile, productId)
                        .then(url => {
                            newThumbnailUrl = url;
                        })
                        .catch(error => {
                            console.error('Thumbnail upload failed:', error);
                            throw error;
                        });
                    uploadPromises.push(thumbnailUploadPromise);
                }

                await Promise.all(uploadPromises);

                // Update final form data with new URLs
                const updatedImage = newThumbnailUrl !== '' ? newThumbnailUrl : finalFormData.image;
                finalFormData = {
                    ...finalFormData,
                    images: [...(finalFormData.images || []), ...newImageUrls],
                    image: updatedImage
                };

                // Update state for UI
                setFormData(finalFormData);
                setSelectedFiles([]);
                setThumbnailFile(null);
            }

            // Step 3: Submit final data
            if (isNewProduct) {
                // Update the newly created product with image URLs
                const token = await getIdToken();
                if (!token) {
                    throw new Error('No authentication token available');
                }

                const updateResponse = await fetch('/api/admin/products', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ...finalFormData, id: productId }),
                });

                if (!updateResponse.ok) {
                    const errorData = await updateResponse.json();
                    throw new Error(errorData.error || 'Failed to update product with images');
                }
            } else {
                // For existing products, validate the final data before saving
                try {
                    ProductFormSchema.parse(finalFormData);
                } catch (error) {
                    if (error instanceof z.ZodError) {
                        const newErrors: Record<string, string> = {};
                        const errorDetails: string[] = [];

                        error.errors.forEach(err => {
                            const field = err.path[0] as string;
                            const message = err.message;
                            if (field) {
                                newErrors[field] = message;
                                errorDetails.push(`${field}: ${message}`);
                            }
                        });

                        // Show detailed validation error toast
                        toast({
                            title: "Validation Failed",
                            description: `Please fix the following errors: ${errorDetails.join(', ')}`,
                            variant: "destructive",
                        });

                        setErrors(newErrors);
                        return;
                    }
                    throw error;
                }

                const token = await getIdToken();
                if (!token) {
                    throw new Error('No authentication token available');
                }

                const response = await fetch('/api/admin/products', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ...finalFormData, id: productId }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update product');
                }
            }

            // Show success toast
            toast({
                title: "Success!",
                description: product?.id ? "Product updated successfully" : "Product created successfully",
                variant: "success",
            });

            onSuccess();

        } catch (error) {
            // Show error toast
            const errorMessage = error instanceof Error ? error.message : 'Failed to save product';
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });

            setErrors(prev => ({
                ...prev,
                submit: errorMessage
            }));
        } finally {
            setLoading(false);
            setUploadingImages(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Progress Modal */}
            {(uploadingImages || loading) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
                        <div className="text-center space-y-4">
                            <div className="text-lg font-medium">
                                {uploadingImages ? 'Uploading Images...' :
                                    operationType === 'deleting' ? 'Deleting Product...' : 'Saving Product...'}
                            </div>

                            {uploadingImages && uploadProgress > 0 && (
                                <>
                                    <div className="text-sm text-gray-600">
                                        {uploadProgress}% complete
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </>
                            )}

                            {loading && !uploadingImages && (
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            )}

                            <div className="text-sm text-gray-500">
                                Please wait, do not close this page...
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={onCancel}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {product?.id ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <p className="text-muted-foreground">
                        {product?.id ? 'Update product information and save changes.' : 'Fill in the details to create a new product.'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
                {/* Basic Information */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Product Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Enter product name"
                                className={errors.name ? 'border-destructive' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <select
                                id="category"
                                value={formData.category}
                                onChange={(e) => {
                                    handleChange('category', e.target.value);
                                    handleChange('subCategory', ''); // Reset subcategory
                                    handleChange('brand', ''); // Reset brand
                                }}
                                className={`w-full p-2 border rounded-md bg-background ${errors.category ? 'border-destructive' : 'border-input'
                                    }`}
                            >
                                <option value="">Select category</option>
                                {Object.keys(categoryData.categories).map((cat: string) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.category}
                                </p>
                            )}
                        </div>

                        {/* Subcategory */}
                        <div className="space-y-2">
                            <Label htmlFor="subCategory">Subcategory *</Label>
                            <select
                                id="subCategory"
                                value={formData.subCategory}
                                onChange={(e) => handleChange('subCategory', e.target.value)}
                                disabled={!formData.category}
                                className={`w-full p-2 border rounded-md bg-background ${errors.subCategory ? 'border-destructive' : 'border-input'
                                    } ${!formData.category ? 'opacity-50' : ''}`}
                            >
                                <option value="">Select subcategory</option>
                                {formData.category && categoryData.subcategoriesByCategory[formData.category]?.map((subcat: string) => (
                                    <option key={subcat} value={subcat}>{subcat}</option>
                                ))}
                            </select>
                            {errors.subCategory && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.subCategory}
                                </p>
                            )}
                        </div>

                        {/* Brand */}
                        <div className="space-y-2">
                            <Label htmlFor="brand">Brand *</Label>
                            <select
                                id="brand"
                                value={formData.brand}
                                onChange={(e) => handleChange('brand', e.target.value)}
                                disabled={!formData.subCategory || dataLoading}
                                className={`w-full p-2 border border-input rounded-md bg-background ${!formData.subCategory || dataLoading ? 'opacity-50' : ''
                                    }`}
                            >
                                <option value="">
                                    {dataLoading
                                        ? 'Loading data...'
                                        : !formData.subCategory
                                            ? 'Select subcategory first'
                                            : 'Select brand'
                                    }
                                </option>
                                {formData.category && formData.subCategory &&
                                    categoryData.brandsBySubcategory[formData.category]?.[formData.subCategory]?.map((brand: string) => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                            </select>
                            {errors.brand && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.brand}
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Pricing */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Actual Price */}
                        <div className="space-y-2">
                            <Label htmlFor="actualPrice" className="font-currency">Actual Price (₹) *</Label>
                            <Input
                                id="actualPrice"
                                type="number"
                                value={formData.actualPrice || ''}
                                onChange={(e) => handleChange('actualPrice', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                min="0"
                                step="0.01"
                                className={errors.actualPrice ? 'border-destructive' : ''}
                            />
                            {errors.actualPrice && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.actualPrice}
                                </p>
                            )}
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <Label htmlFor="price" className="font-currency">Selling Price (₹)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price || ''}
                                onChange={(e) => handleChange('price', e.target.value ? parseFloat(e.target.value) : undefined)}
                                placeholder="Leave empty to use discount %"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        {/* Discount Percentage */}
                        <div className="space-y-2">
                            <Label htmlFor="discountPercentage">Discount %</Label>
                            <Input
                                id="discountPercentage"
                                type="number"
                                value={formData.discountPercentage || ''}
                                onChange={(e) => handleChange('discountPercentage', e.target.value ? parseFloat(e.target.value) : null)}
                                placeholder="0"
                                min="0"
                                max="100"
                                step="0.01"
                            />
                        </div>
                    </div>
                </Card>

                {/* Product Details */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Product Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Rating */}
                        <div className="space-y-2">
                            <Label htmlFor="rating">Rating *</Label>
                            <Input
                                id="rating"
                                type="number"
                                value={formData.rating}
                                onChange={(e) => handleChange('rating', parseFloat(e.target.value) || 0)}
                                placeholder="4.5"
                                min="0"
                                max="5"
                                step="0.1"
                                className={errors.rating ? 'border-destructive' : ''}
                            />
                            {errors.rating && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.rating}
                                </p>
                            )}
                        </div>

                        {/* Inventory */}
                        <div className="space-y-2">
                            <Label htmlFor="inventory">Inventory Count *</Label>
                            <Input
                                id="inventory"
                                type="number"
                                value={formData.inventory}
                                onChange={(e) => handleChange('inventory', parseInt(e.target.value) || 0)}
                                placeholder="1"
                                min="0"
                                className={errors.inventory ? 'border-destructive' : ''}
                            />
                            {errors.inventory && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.inventory}
                                </p>
                            )}
                        </div>

                        {/* Short Description */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="shortDescription">Short Description</Label>
                            <Input
                                id="shortDescription"
                                value={formData.shortDescription}
                                onChange={(e) => handleChange('shortDescription', e.target.value)}
                                placeholder="Brief product description"
                            />
                        </div>

                        {/* Details */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="details">Detailed Description</Label>
                            <textarea
                                id="details"
                                value={formData.details}
                                onChange={(e) => handleChange('details', e.target.value)}
                                placeholder="Detailed product information"
                                rows={4}
                                className="w-full p-2 border border-input rounded-md bg-background resize-none"
                            />
                        </div>

                        {/* Recommended */}
                        <div className="space-y-2 md:col-span-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isRecommended"
                                    checked={formData.isRecommended}
                                    onCheckedChange={(checked) => handleChange('isRecommended', checked)}
                                />
                                <Label htmlFor="isRecommended">Show on home screen</Label>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Product Images */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Product Images</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Thumbnail Upload */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Product Thumbnail *
                                <span className="text-xs text-gray-500 ml-2">
                                    (Main display image, compressed to 50-100KB)
                                </span>
                            </label>

                            {/* Thumbnail Upload Area */}
                            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={(e) => handleThumbnailFiles(e.target.files)}
                                    className="hidden"
                                    id="thumbnail-upload"
                                    disabled={uploadingImages}
                                />
                                <label htmlFor="thumbnail-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-2">
                                    <Upload className="w-6 h-6 mb-2 text-gray-400" />
                                    <p className="text-xs text-gray-600">
                                        {uploadingImages ? 'Uploading...' : 'Click to select'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        50-100KB
                                    </p>
                                </label>
                            </div>

                            {errors.image && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.image}
                                </p>
                            )}

                            {/* Selected Thumbnail Preview (before upload) */}
                            {thumbnailFile && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700">Selected Thumbnail (ready to upload)</h4>
                                    <div className="relative group">
                                        <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                            <img
                                                src={URL.createObjectURL(thumbnailFile)}
                                                alt="Thumbnail preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleRemoveSelectedThumbnail}
                                            className="absolute -top-2 -right-2 w-6 h-6 p-0"
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                        <div className="text-xs text-gray-600 mt-1 truncate">{thumbnailFile.name}</div>
                                        <div className="text-xs text-gray-500">{formatFileSize(thumbnailFile.size)}</div>
                                    </div>
                                </div>
                            )}

                            {/* Uploaded Thumbnail Preview */}
                            {formData.image && !thumbnailFile && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700">Current Thumbnail</h4>
                                    <div className="relative">
                                        <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                            <img
                                                src={formData.image}
                                                alt="Current thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Main Images Upload */}
                        <div className="lg:col-span-2 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Images *
                                    <span className="text-xs text-gray-500 ml-2">
                                        (Multiple images, compressed to 150-300KB each)
                                    </span>
                                </label>

                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={(e) => handleImageFiles(e.target.files)}
                                        className="hidden"
                                        id="image-upload"
                                        disabled={uploadingImages}
                                    />
                                    <label htmlFor="image-upload" className="cursor-pointer">
                                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                        <p className="text-sm text-gray-600">
                                            {uploadingImages ? `Uploading... ${uploadProgress}%` : 'Click to select images or drag and drop'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            JPEG, PNG, WebP • Max {UPLOAD_CONFIG.MAX_IMAGES} images • Will be compressed to 150-300KB
                                        </p>
                                    </label>
                                </div>
                            </div>

                            {errors.images && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.images}
                                </p>
                            )}

                            {/* Selected Files Preview (before upload) */}
                            {selectedFiles.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700">Selected Files (ready to upload)</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="relative group bg-gray-50 rounded-lg p-2">
                                                <div className="text-xs text-gray-600 truncate">{file.name}</div>
                                                <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleRemoveSelectedFile(index)}
                                                    className="absolute top-1 right-1 w-5 h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Uploaded Images Preview */}
                            {formData.images && formData.images.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700">Uploaded Images</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {formData.images.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={url}
                                                    alt={`Product image ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleRemoveUploadedImage(index)}
                                                    className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Form Actions */}
                <div className="flex items-center justify-between gap-4">
                    {/* Delete button - left side (only for existing products) */}
                    <div className="flex items-center gap-4">
                        {product?.id && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={loading}
                                className="h-10"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Product
                            </Button>
                        )}
                    </div>

                    {/* Error message and action buttons - right side */}
                    <div className="flex items-center gap-4">
                        {errors.submit && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.submit}
                            </p>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="h-10"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-10"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {product?.id ? 'Update Product' : 'Create Product'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}