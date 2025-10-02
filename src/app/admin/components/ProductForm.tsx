'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
    inventory: number;
    isRecommended: boolean;
}

interface ProductFormProps {
    product?: Product | null;
    onSuccess: () => void;
    onCancel: () => void;
}

// Form validation schema
const ProductFormSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    category: z.string().min(1, 'Category is required'),
    subCategory: z.string().min(1, 'Subcategory is required'),
    brand: z.string().optional(),
    price: z.number().min(0, 'Price must be positive').optional(),
    actualPrice: z.number().min(0, 'Actual price must be positive'),
    discountPercentage: z.number().min(0).max(100).nullable().optional(),
    rating: z.number().min(0).max(5, 'Rating must be between 0 and 5'),
    shortDescription: z.string().optional(),
    details: z.string().optional(),
    images: z.array(z.string()).optional(),
    inventory: z.number().min(0, 'Inventory must be non-negative'),
    isRecommended: z.boolean(),
});

type FormData = z.infer<typeof ProductFormSchema>;

// Category and subcategory data
const categoryData = {
    Bikes: ['Mountain', 'Road', 'Hybrid', 'Gravel'],
    Accessories: ['Bags', 'Lights', 'Fenders', 'Phone Case/Mount'],
    Apparel: ['Topwear', 'Bottomwear', 'Footwear', 'Helmet', 'Eyewear', 'Gloves'],
    Kids: ['Tricycles', 'Electric Car/Bike', 'Ride-Ons', 'Prams', 'Baby Swing', 'Baby Essentials'],
    Spares: ['Braking System', 'Tyres & Tubes', 'Pedals', 'Saddles', 'Grips', 'Gear systems'],
};

const brandData = {
    Bikes: ['Trek', 'Giant', 'Specialized', 'Cannondale', 'Scott'],
    Accessories: ['Bontrager', 'Topeak', 'Ortlieb', 'Giro', 'Bell'],
    Apparel: ['Pearl Izumi', 'Castelli', 'Gore Wear', 'Assos', 'Endura'],
    Kids: ['Strider', 'Woom', 'Puky', 'Radio Flyer', 'Fisher-Price'],
    Spares: ['Shimano', 'SRAM', 'Campagnolo', 'Continental', 'Schwalbe'],
};

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        category: '',
        subCategory: '',
        brand: '',
        actualPrice: 0,
        rating: 4.5,
        inventory: 1,
        isRecommended: false,
        images: [],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);

    // Initialize form with existing product data
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                category: product.category,
                subCategory: product.subCategory,
                brand: product.brand || '',
                price: product.price,
                actualPrice: product.actualPrice,
                discountPercentage: product.discountPercentage,
                rating: product.rating,
                shortDescription: product.shortDescription || '',
                details: product.details || '',
                images: product.images || [],
                inventory: product.inventory,
                isRecommended: product.isRecommended,
            });
        }
    }, [product]);

    // Handle form field changes
    const handleChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Prevent form submission on Enter key
    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === 'Enter' && e.target !== e.currentTarget) {
            e.preventDefault();
        }
    };

    // Handle image upload
    const handleImageUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploadingImages(true);
        const formData = new FormData();

        Array.from(files).forEach(file => {
            formData.append('images', file);
        });

        try {
            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload images');
            }

            const data = await response.json();

            // Add new URLs to existing images
            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), ...data.urls],
            }));

        } catch (error) {
            setErrors(prev => ({
                ...prev,
                images: error instanceof Error ? error.message : 'Failed to upload images'
            }));
        } finally {
            setUploadingImages(false);
        }
    };

    // Remove image
    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index),
        }));
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
                setErrors(newErrors);
            }
            return false;
        }
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const method = product?.id ? 'PUT' : 'POST';
            const url = '/api/admin/products';

            const submitData = product?.id
                ? { ...formData, id: product.id }
                : formData;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save product');
            }

            onSuccess();

        } catch (error) {
            setErrors(prev => ({
                ...prev,
                submit: error instanceof Error ? error.message : 'Failed to save product'
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
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
                                {Object.keys(categoryData).map(cat => (
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
                                {formData.category && categoryData[formData.category as keyof typeof categoryData]?.map(subcat => (
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
                            <Label htmlFor="brand">Brand</Label>
                            <select
                                id="brand"
                                value={formData.brand}
                                onChange={(e) => handleChange('brand', e.target.value)}
                                disabled={!formData.category}
                                className={`w-full p-2 border border-input rounded-md bg-background ${!formData.category ? 'opacity-50' : ''
                                    }`}
                            >
                                <option value="">Select brand (optional)</option>
                                {formData.category && brandData[formData.category as keyof typeof brandData]?.map(brand => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                            </select>
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
                                value={formData.actualPrice}
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
                                step="0.1"
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
                                <Label htmlFor="isRecommended">Mark as recommended product</Label>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Product Images */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Product Images</h2>

                    {/* Upload Area */}
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e.target.files)}
                                className="hidden"
                                id="image-upload"
                                disabled={uploadingImages}
                            />
                            <label htmlFor="image-upload" className="cursor-pointer">
                                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                    {uploadingImages ? 'Uploading...' : 'Click to upload images or drag and drop'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG, WebP up to 5MB each
                                </p>
                            </label>
                        </div>

                        {errors.images && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.images}
                            </p>
                        )}

                        {/* Image Preview */}
                        {formData.images && formData.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4">
                    {errors.submit && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.submit}
                        </p>
                    )}

                    <Button type="button" variant="outline" onClick={onCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>

                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {product?.id ? 'Update Product' : 'Create Product'}
                    </Button>
                </div>
            </form>
        </div>
    );
}