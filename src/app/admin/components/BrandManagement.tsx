'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import {
    Plus,
    Search,
    Trash2,
    Tags,
    AlertCircle,
    Save,
    X,
    Upload
} from 'lucide-react';
import { uploadBrandLogo } from '@/lib/utils/firebaseStorage';
import { validateImageFile } from '@/lib/utils/imageCompression';

/**
 * Brand Management Interface for Admin Panel.
 * 
 * **Features:**
 * - View all brands organized by category and subcategory
 * - Add new brands to specific categories/subcategories
 * - Remove brands with confirmation
 * - Search and filter brands across categories
 * - Real-time updates to category structure
 * 
 * **Architecture:**
 * - Fetches brands from the categories document structure
 * - Updates are persisted to Firestore categories collection
 * - Optimistic UI updates for better user experience
 */

interface Brand {
    name: string;
    category: string;
    subcategory: string;
}

interface CategoryStructure {
    [category: string]: {
        subcategories: {
            [subcategory: string]: {
                brands: string[];
            };
        };
    };
}

export default function BrandManagement() {
    const { toast } = useToast();
    const { getIdToken } = useAuth();

    const [brands, setBrands] = useState<Brand[]>([]);
    const [categoryStructure, setCategoryStructure] = useState<CategoryStructure>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const hasFetchedBrands = useRef(false);    // Add brand form state
    const [newBrand, setNewBrand] = useState({
        name: '',
        category: '',
        subcategory: '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [addingBrand, setAddingBrand] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    // Fetch brands and category structure
    const fetchBrands = async () => {
        if (hasFetchedBrands.current) return;
        hasFetchedBrands.current = true;

        setLoading(true);
        setError(null);

        try {
            const token = await getIdToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch('/api/admin/brands', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch brands');
            }

            const data = await response.json();
            setBrands(data.brands);
            setCategoryStructure(data.categoriesStructure);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load brands');
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchBrands();
    }, []);

    // Filter brands based on search term
    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group filtered brands by category
    const brandsByCategory = filteredBrands.reduce((acc, brand) => {
        if (!acc[brand.category]) {
            acc[brand.category] = {};
        }
        if (!acc[brand.category][brand.subcategory]) {
            acc[brand.category][brand.subcategory] = [];
        }
        acc[brand.category][brand.subcategory].push(brand.name);
        return acc;
    }, {} as Record<string, Record<string, string[]>>);

    // Handle adding new brand
    const handleAddBrand = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newBrand.name || !newBrand.category || !newBrand.subcategory) {
            setAddError('All fields are required');
            return;
        }

        if (!logoFile) {
            setAddError('Brand logo is required');
            return;
        }

        // Validate logo file
        try {
            validateImageFile(logoFile);
        } catch (error) {
            setAddError(error instanceof Error ? error.message : 'Invalid logo file');
            return;
        }

        // Show confirmation dialog
        const confirmed = window.confirm(
            `Are you sure you want to add "${newBrand.name}" to ${newBrand.category} > ${newBrand.subcategory}?\n\nThis will upload the brand logo and add the brand to the category.`
        );

        if (!confirmed) return;

        setAddingBrand(true);
        setAddError(null);

        try {
            // First upload the logo
            setUploadingLogo(true);
            await uploadBrandLogo(logoFile, newBrand.name);
            setUploadingLogo(false);

            // Then add the brand to the database
            const token = await getIdToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch('/api/admin/brands', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBrand),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add brand');
            }

            // Show success toast
            toast({
                title: "Success!",
                description: `Brand "${newBrand.name}" added successfully with logo`,
                variant: "success",
            });

            // Optimistically update the UI
            setBrands(prev => [...prev, newBrand]);

            // Reset form
            setNewBrand({ name: '', category: '', subcategory: '' });
            setLogoFile(null);
            setShowAddForm(false);

            // Refresh data to ensure consistency
            fetchBrands();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add brand';
            setAddError(errorMessage);

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setAddingBrand(false);
            setUploadingLogo(false);
        }
    };

    // Handle removing brand
    const handleRemoveBrand = async (brand: Brand) => {
        // Show detailed confirmation dialog
        const confirmed = window.confirm(
            `Are you sure you want to delete "${brand.name}"?\n\n` +
            `This will:\n` +
            `• Remove the brand from ${brand.category} > ${brand.subcategory}\n` +
            `• Delete the brand logo from storage\n` +
            `• This action cannot be undone`
        );

        if (!confirmed) return;

        try {
            const token = await getIdToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch(`/api/admin/brands?name=${encodeURIComponent(brand.name)}&category=${encodeURIComponent(brand.category)}&subcategory=${encodeURIComponent(brand.subcategory)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove brand');
            }

            // Show success toast
            toast({
                title: "Success!",
                description: `Brand "${brand.name}" deleted successfully`,
                variant: "success",
            });

            // Optimistically update the UI
            setBrands(prev => prev.filter(b =>
                !(b.name === brand.name && b.category === brand.category && b.subcategory === brand.subcategory)
            ));

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove brand';
            setError(errorMessage);

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    // Get subcategories for selected category
    const getSubcategories = (category: string): string[] => {
        if (!categoryStructure[category]) return [];
        return Object.keys(categoryStructure[category].subcategories || {});
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Brand Management</h1>
                    <p className="text-muted-foreground">
                        Manage brands across categories and subcategories. Add new brands or remove existing ones.
                    </p>
                </div>
                <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Brand
                </Button>
            </div>

            {/* Search */}
            <Card className="p-6">
                <div className="space-y-2">
                    <Label htmlFor="search">Search Brands</Label>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="search"
                            placeholder="Search by brand name, category, or subcategory..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </Card>

            {/* Add Brand Form */}
            {showAddForm && (
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Add New Brand</h2>
                        <Button variant="outline" size="sm" onClick={() => {
                            setShowAddForm(false);
                            setAddError(null);
                            setNewBrand({ name: '', category: '', subcategory: '' });
                            setLogoFile(null);
                        }}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <form onSubmit={handleAddBrand} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Brand Name */}
                            <div className="space-y-2">
                                <Label htmlFor="brandName">Brand Name *</Label>
                                <Input
                                    id="brandName"
                                    value={newBrand.name}
                                    onChange={(e) => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter brand name"
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="brandCategory">Category *</Label>
                                <select
                                    id="brandCategory"
                                    value={newBrand.category}
                                    onChange={(e) => setNewBrand(prev => ({
                                        ...prev,
                                        category: e.target.value,
                                        subcategory: '' // Reset subcategory when category changes
                                    }))}
                                    className="w-full p-2 border border-input rounded-md bg-background"
                                >
                                    <option value="">Select category</option>
                                    {Object.keys(categoryStructure).map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Subcategory */}
                            <div className="space-y-2">
                                <Label htmlFor="brandSubcategory">Subcategory *</Label>
                                <select
                                    id="brandSubcategory"
                                    value={newBrand.subcategory}
                                    onChange={(e) => setNewBrand(prev => ({ ...prev, subcategory: e.target.value }))}
                                    disabled={!newBrand.category}
                                    className={`w-full p-2 border border-input rounded-md bg-background ${!newBrand.category ? 'opacity-50' : ''
                                        }`}
                                >
                                    <option value="">Select subcategory</option>
                                    {getSubcategories(newBrand.category).map(subcategory => (
                                        <option key={subcategory} value={subcategory}>{subcategory}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Brand Logo Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="brandLogo">Brand Logo *</Label>
                            <div className="space-y-2">
                                <Input
                                    id="brandLogo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            try {
                                                validateImageFile(file);
                                                setLogoFile(file);
                                                setAddError(null);
                                            } catch (error) {
                                                setAddError(error instanceof Error ? error.message : 'Invalid logo file');
                                                setLogoFile(null);
                                                e.target.value = '';
                                            }
                                        } else {
                                            setLogoFile(null);
                                        }
                                    }}
                                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Upload a logo image (JPEG, PNG, WebP). Will be compressed to under 50KB.
                                </p>
                                {logoFile && (
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <Upload className="w-3 h-3" />
                                        Selected: {logoFile.name} ({(logoFile.size / 1024).toFixed(1)}KB)
                                    </div>
                                )}
                            </div>
                        </div>

                        {addError && (
                            <div className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {addError}
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={addingBrand || uploadingLogo} className="flex items-center gap-2">
                                {uploadingLogo ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Uploading Logo...
                                    </>
                                ) : addingBrand ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Adding Brand...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Add Brand
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-destructive">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}

            {/* Brands List */}
            {!loading && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Tags className="w-4 h-4" />
                            <span>{filteredBrands.length} brands total</span>
                        </div>
                        <div>
                            <span>{Object.keys(brandsByCategory).length} categories</span>
                        </div>
                    </div>

                    {/* Brands by Category */}
                    {Object.keys(brandsByCategory).length > 0 ? (
                        <div className="space-y-6">
                            {Object.entries(brandsByCategory).map(([category, subcategories]) => (
                                <Card key={category} className="p-6">
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Badge variant="default" className="bg-primary/10 text-primary">
                                            {category}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            ({Object.values(subcategories).flat().length} brands)
                                        </span>
                                    </h2>

                                    <div className="space-y-4">
                                        {Object.entries(subcategories).map(([subcategory, brandNames]) => (
                                            <div key={subcategory} className="space-y-2">
                                                <h3 className="font-medium text-foreground flex items-center gap-2">
                                                    <Badge variant="outline">{subcategory}</Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        ({brandNames.length} brands)
                                                    </span>
                                                </h3>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                                                    {brandNames.map((brandName) => (
                                                        <div
                                                            key={`${category}-${subcategory}-${brandName}`}
                                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                                                        >
                                                            <span className="font-medium text-sm">{brandName}</span>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRemoveBrand({
                                                                    name: brandName,
                                                                    category,
                                                                    subcategory
                                                                })}
                                                                className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            {searchTerm ? (
                                <div>
                                    <Tags className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium mb-2">No brands found</p>
                                    <p>Try adjusting your search terms or add a new brand.</p>
                                </div>
                            ) : (
                                <div>
                                    <Tags className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium mb-2">No brands available</p>
                                    <p>Add your first brand to get started.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}