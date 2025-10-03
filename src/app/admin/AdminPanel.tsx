'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Package,
    Tags,
    LogOut,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Upload,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import ProductManagement from './components/ProductManagement';
import BrandManagement from './components/BrandManagement';

/**
 * Admin Panel Interface with comprehensive product and brand management.
 * 
 * **Features:**
 * - Product CRUD operations with advanced filtering
 * - Brand management with category associations
 * - Image upload with compression and validation
 * - Responsive design matching homepage theme
 * - Secure authentication and data validation
 * 
 * **Architecture:**
 * - Component-based design for maintainability
 * - Consistent blue theme following homepage styles
 * - Proper form validation with Zod schemas
 * - Optimized API calls with loading states
 */

type AdminTab = 'products' | 'brands';

interface AdminPanelProps {
    logoutCallback: () => void;
}

export default function AdminPanel({ logoutCallback }: AdminPanelProps) {
    const [activeTab, setActiveTab] = useState<AdminTab>('products');

    return (
        <div className="min-h-screen ">
            {/* Header */}
            <header className="bg-white border-b border-border shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Title */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-foreground">Admin Panel</span>
                            </div>
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                                Let's Ride Cycles
                            </Badge>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={logoutCallback}
                                className="flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="mb-8">
                    <nav className="flex space-x-8 border-b border-border">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'products'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Product Management
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('brands')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'brands'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Tags className="w-4 h-4" />
                                Brand Management
                            </div>
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'products' && <ProductManagement />}
                    {activeTab === 'brands' && <BrandManagement />}
                </div>
            </div>
        </div>
    );
}