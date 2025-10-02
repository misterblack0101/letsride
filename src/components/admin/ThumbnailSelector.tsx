/**
 * Thumbnail Image Selector Component
 * 
 * **Features:**
 * - Separate from main image upload
 * - Client-side compression to 50-100KB
 * - Preview thumbnail before upload
 * - Drag and drop support
 * - Validates image format and size
 * 
 * **Usage:**
 * Used in ProductForm for selecting the main product thumbnail
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { validateImageFile, compressThumbnail, formatFileSize } from '@/lib/utils/imageCompression';

interface ThumbnailSelectorProps {
    onThumbnailSelect: (file: File) => void;
    onThumbnailRemove: () => void;
    currentThumbnail?: string;
    isUploading?: boolean;
    error?: string;
}

export default function ThumbnailSelector({
    onThumbnailSelect,
    onThumbnailRemove,
    currentThumbnail,
    isUploading = false,
    error
}: ThumbnailSelectorProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentThumbnail || null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync preview URL when currentThumbnail prop changes (after upload)
    useEffect(() => {
        if (currentThumbnail && currentThumbnail !== previewUrl) {
            setPreviewUrl(currentThumbnail);
        }
    }, [currentThumbnail, previewUrl]);

    const handleFileSelect = async (file: File) => {
        try {
            setIsCompressing(true);

            // Validate file
            validateImageFile(file);

            // Create preview
            const previewUrl = URL.createObjectURL(file);
            setPreviewUrl(previewUrl);

            // Compress thumbnail
            const compressedThumbnail = await compressThumbnail(file);

            // Call parent callback
            onThumbnailSelect(compressedThumbnail);

        } catch (error) {
            console.error('Error processing thumbnail:', error);
            // The error will be handled by the parent component
        } finally {
            setIsCompressing(false);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleRemove = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        onThumbnailRemove();

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                Product Thumbnail *
                <span className="text-xs text-gray-500 ml-2">
                    (Main display image, compressed to 50-100KB)
                </span>
            </label>

            <div className="relative">
                {previewUrl ? (
                    // Preview Mode
                    <div className="relative group">
                        <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <img
                                src={previewUrl}
                                alt="Thumbnail preview"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Remove button */}
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={isUploading || isCompressing}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
                                     opacity-0 group-hover:opacity-100 transition-opacity
                                     hover:bg-red-600 disabled:opacity-50"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Upload/compression status */}
                        {(isUploading || isCompressing) && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                <div className="text-white text-xs">
                                    {isCompressing ? 'Compressing...' : 'Uploading...'}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Upload Mode
                    <div
                        onClick={handleClick}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`
                            w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer
                            flex flex-col items-center justify-center text-center p-3
                            transition-colors
                            ${isDragOver
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                            }
                            ${(isUploading || isCompressing) ? 'cursor-not-allowed opacity-50' : ''}
                        `}
                    >
                        {isCompressing ? (
                            <div className="text-center">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                                <div className="text-xs text-gray-600">Compressing...</div>
                            </div>
                        ) : (
                            <>
                                <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                                <div className="text-xs text-gray-600">
                                    Click or drag thumbnail
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileInput}
                    disabled={isUploading || isCompressing}
                    className="hidden"
                />
            </div>

            {/* Error message */}
            {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                </div>
            )}

            {/* Help text */}
            <div className="text-xs text-gray-500">
                <div>• JPEG, PNG, or WebP format</div>
                <div>• Will be compressed to 50-100KB</div>
                <div>• Used as main product display image</div>
            </div>
        </div>
    );
}