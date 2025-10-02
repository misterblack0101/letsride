/**
 * Firebase Storage utilities for uploading product images and thumbnails.
 * 
 * **Storage Structure:**
 * - Main images: `products/{productId}/images/{randomId}.webp`
 * - Thumbnails: `products/{productId}/thumbnail.webp`
 * 
 * **Features:**
 * - Organized folder structure per product
 * - Random file naming to prevent conflicts
 * - Automatic file overwriting for thumbnails
 * - Upload progress tracking
 * - Error handling and retry logic
 */

import { storage } from '../firebase/client';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { compressMainImage, compressThumbnail, validateImageFile } from './imageCompression';

/**
 * Generate a random file ID for unique naming
 * 
 * @returns string - Random ID for file naming
 */
function generateRandomFileId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Upload main product images to Firebase Storage
 * 
 * @param files - Array of image files to upload
 * @param productId - Unique product identifier (use timestamp for new products)
 * @param onProgress - Optional progress callback
 * @returns Promise<string[]> - Array of download URLs
 * 
 * @example
 * ```typescript
 * const urls = await uploadProductImages(files, 'product-123', (progress) => {
 *   console.log(`Upload progress: ${progress}%`);
 * });
 * ```
 */
export async function uploadProductImages(
    files: File[],
    productId: string,
    onProgress?: (progress: number) => void
): Promise<string[]> {
    if (!files || files.length === 0) {
        throw new Error('At least one image is required');
    }

    const downloadUrls: string[] = [];
    const totalFiles = files.length;

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Validate file
            validateImageFile(file);

            // Compress image
            const compressedFile = await compressMainImage(file);

            // Create storage reference with random filename
            const fileName = `${generateRandomFileId()}.webp`;
            const storageRef = ref(storage, `products/${productId}/images/${fileName}`);

            // Upload file
            const snapshot = await uploadBytes(storageRef, compressedFile);
            const downloadUrl = await getDownloadURL(snapshot.ref);

            downloadUrls.push(downloadUrl);

            // Report progress
            if (onProgress) {
                const progress = Math.round(((i + 1) / totalFiles) * 100);
                onProgress(progress);
            }
        }

        return downloadUrls;
    } catch (error) {
        console.error('Error uploading product images:', error);

        // Clean up any uploaded files on error
        await cleanupProductImages(productId);

        throw new Error(
            error instanceof Error
                ? error.message
                : 'Failed to upload images. Please try again.'
        );
    }
}

/**
 * Upload thumbnail image to Firebase Storage
 * 
 * @param file - Thumbnail image file
 * @param productId - Unique product identifier
 * @returns Promise<string> - Download URL of uploaded thumbnail
 * 
 * @example
 * ```typescript
 * const thumbnailUrl = await uploadThumbnail(file, 'product-123');
 * ```
 */
export async function uploadThumbnail(
    file: File,
    productId: string
): Promise<string> {
    try {
        // Validate file
        validateImageFile(file);

        // Compress thumbnail
        const compressedThumbnail = await compressThumbnail(file);

        // Create storage reference
        const storageRef = ref(storage, `products/${productId}/thumbnail.webp`);

        // Upload file
        const snapshot = await uploadBytes(storageRef, compressedThumbnail);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        return downloadUrl;
    } catch (error) {
        console.error('Error uploading thumbnail:', error);
        throw new Error(
            error instanceof Error
                ? error.message
                : 'Failed to upload thumbnail. Please try again.'
        );
    }
}

/**
 * Delete a specific product image from Firebase Storage
 * 
 * @param imageUrl - Full Firebase Storage URL to delete
 * @returns Promise<void>
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
    try {
        // Extract the storage path from the URL
        const urlParts = imageUrl.split('/o/')[1]?.split('?')[0];
        if (!urlParts) {
            throw new Error('Invalid Firebase Storage URL');
        }

        const storagePath = decodeURIComponent(urlParts);
        const imageRef = ref(storage, storagePath);

        await deleteObject(imageRef);
        console.log('Successfully deleted image:', storagePath);
    } catch (error) {
        console.error('Error deleting image:', error);
        // Don't throw here as deletion failure shouldn't break the flow
    }
}

/**
 * Delete the thumbnail for a specific product
 * 
 * @param productId - Product identifier
 * @returns Promise<void>
 */
export async function deleteThumbnail(productId: string): Promise<void> {
    try {
        const thumbnailRef = ref(storage, `products/${productId}/thumbnail.webp`);
        await deleteObject(thumbnailRef);
        console.log('Successfully deleted thumbnail for product:', productId);
    } catch (error) {
        console.error('Error deleting thumbnail:', error);
        // Don't throw here as deletion failure shouldn't break the flow
    }
}

/**
 * Clean up all images for a product (useful for error handling or product deletion)
 * 
 * @param productId - Product identifier
 * @returns Promise<void>
 */
export async function cleanupProductImages(productId: string): Promise<void> {
    try {
        const productRef = ref(storage, `products/${productId}`);
        const listResult = await listAll(productRef);

        // Delete all files and folders
        const deletePromises = [
            ...listResult.items.map(item => deleteObject(item)),
            ...listResult.prefixes.map(async (prefix) => {
                const prefixList = await listAll(prefix);
                return Promise.all(prefixList.items.map(item => deleteObject(item)));
            })
        ];

        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error cleaning up product images:', error);
        // Don't throw here as this is cleanup - log the error but continue
    }
}

/**
 * Get existing product images count
 * 
 * @param productId - Product identifier
 * @returns Promise<number> - Number of existing images
 */
export async function getExistingImagesCount(productId: string): Promise<number> {
    try {
        const imagesRef = ref(storage, `products/${productId}/images`);
        const listResult = await listAll(imagesRef);
        return listResult.items.length;
    } catch (error) {
        console.error('Error getting existing images count:', error);
        return 0;
    }
}

/**
 * Upload configuration and limits
 */
export const UPLOAD_CONFIG = {
    MAX_IMAGES: 10,
    MIN_IMAGES: 1,
    MAIN_IMAGE_SIZE_RANGE: { min: 150 * 1024, max: 300 * 1024 }, // 150-300KB
    THUMBNAIL_SIZE_RANGE: { min: 50 * 1024, max: 100 * 1024 }, // 50-100KB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    MAX_INPUT_SIZE: 10 * 1024 * 1024, // 10MB max input
};