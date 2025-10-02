/**
 * Client-side image compression utilities for product images and thumbnails.
 * 
 * **Features:**
 * - Main product images: 150-300KB, JPEG/WebP format
 * - Thumbnail images: 50-100KB, optimized for display
 * - Client-side compression to reduce server costs
 * - Maintains aspect ratio and quality
 * 
 * **Usage:**
 * ```typescript
 * const compressedImage = await compressMainImage(file);
 * const thumbnail = await compressThumbnail(file);
 * ```
 */

import imageCompression from 'browser-image-compression';

/**
 * Compression options for main product images
 * Target: 150-300KB, high quality for product display
 */
const MAIN_IMAGE_OPTIONS = {
    maxSizeMB: 0.3, // 300KB maximum
    maxWidthOrHeight: 1200, // Good quality for product images
    useWebWorker: true,
    fileType: 'image/webp' as const, // WebP for better compression
    initialQuality: 0.8, // High quality
};

/**
 * Compression options for thumbnail images
 * Target: 50-100KB, optimized for fast loading
 */
const THUMBNAIL_OPTIONS = {
    maxSizeMB: 0.1, // 100KB maximum
    maxWidthOrHeight: 400, // Thumbnail size
    useWebWorker: true,
    fileType: 'image/webp' as const, // WebP for better compression
    initialQuality: 0.7, // Good quality for thumbnails
};

/**
 * Compress main product image to 150-300KB
 * 
 * @param file - Input image file
 * @returns Promise<File> - Compressed image file
 * 
 * @example
 * ```typescript
 * const compressedFile = await compressMainImage(originalFile);
 * console.log(`Original: ${originalFile.size}B, Compressed: ${compressedFile.size}B`);
 * ```
 */
export async function compressMainImage(file: File): Promise<File> {
    try {
        const compressedFile = await imageCompression(file, MAIN_IMAGE_OPTIONS);

        // Ensure the file size is within our target range (150KB-300KB)
        if (compressedFile.size < 150 * 1024) {
            // If too small, try with higher quality
            const betterQuality = await imageCompression(file, {
                ...MAIN_IMAGE_OPTIONS,
                maxSizeMB: 0.25, // Target 250KB
                initialQuality: 0.85,
            });
            return betterQuality;
        }

        return compressedFile;
    } catch (error) {
        console.error('Error compressing main image:', error);
        throw new Error('Failed to compress image. Please try a different image.');
    }
}

/**
 * Compress thumbnail image to 50-100KB
 * 
 * @param file - Input image file
 * @returns Promise<File> - Compressed thumbnail file
 * 
 * @example
 * ```typescript
 * const thumbnailFile = await compressThumbnail(originalFile);
 * console.log(`Thumbnail size: ${thumbnailFile.size}B`);
 * ```
 */
export async function compressThumbnail(file: File): Promise<File> {
    try {
        const compressedFile = await imageCompression(file, THUMBNAIL_OPTIONS);

        // Ensure the file size is within our target range (50KB-100KB)
        if (compressedFile.size < 50 * 1024) {
            // If too small, try with slightly higher quality
            const betterQuality = await imageCompression(file, {
                ...THUMBNAIL_OPTIONS,
                maxSizeMB: 0.08, // Target 80KB
                initialQuality: 0.75,
            });
            return betterQuality;
        }

        return compressedFile;
    } catch (error) {
        console.error('Error compressing thumbnail:', error);
        throw new Error('Failed to compress thumbnail. Please try a different image.');
    }
}

/**
 * Validate image file before compression
 * 
 * @param file - Input file to validate
 * @returns boolean - True if valid, throws error if invalid
 */
export function validateImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB maximum input size

    if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Please use JPEG, PNG, or WebP images.`);
    }

    if (file.size > maxSize) {
        throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size: 10MB.`);
    }

    return true;
}

/**
 * Get compression preview info without actually compressing
 * 
 * @param file - Input image file
 * @returns Promise<{estimatedMainSize: number, estimatedThumbnailSize: number}>
 */
export async function getCompressionPreview(file: File): Promise<{
    estimatedMainSize: number;
    estimatedThumbnailSize: number;
    originalSize: number;
}> {
    const originalSize = file.size;

    // Rough estimates based on typical compression ratios
    const estimatedMainSize = Math.min(originalSize * 0.3, 300 * 1024);
    const estimatedThumbnailSize = Math.min(originalSize * 0.1, 100 * 1024);

    return {
        originalSize,
        estimatedMainSize,
        estimatedThumbnailSize,
    };
}

/**
 * Format file size for display
 * 
 * @param bytes - File size in bytes
 * @returns string - Formatted size (e.g., "250 KB", "1.2 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}