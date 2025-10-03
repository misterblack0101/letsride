'use client';

import React from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * ProductShareButton enables users to share a product via native share, clipboard, or prompt.
 *
 * **Architecture:**
 * - Client component for product sharing
 * - Uses browser APIs for sharing and clipboard
 *
 * **Usage Context:**
 * - Used on product detail pages
 * - Requires a product object with name and description fields
 *
 * @param props - Props containing the product to share
 *
 * @example
 * ```tsx
 * <ProductShareButton product={product} />
 * ```
 */
interface ProductShareButtonProps {
    /** Product object with required name and optional description fields */
    product: {
        name: string;
        shortDescription?: string;
        details?: string;
    };
}

export default function ProductShareButton({ product }: ProductShareButtonProps) {
    const { toast } = useToast();
    return (
        <button
            type="button"
            className="p-0 m-0 bg-transparent border-none cursor-pointer focus:outline-none hover:scale-110 transition-transform"
            onClick={() => {
                const url = typeof window !== 'undefined' ? window.location.href : '';
                const shareData = {
                    title: product.name,
                    text: product.shortDescription || product.details || 'Check out this product!',
                    url,
                };
                let copied = false;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(url);
                    copied = true;
                }
                if (navigator.share) {
                    navigator.share(shareData).catch(() => { });
                } else if (!navigator.clipboard) {
                    window.prompt('Copy this product link:', url);
                    copied = true;
                }
                if (copied) {
                    toast({
                        title: 'Link copied to clipboard!',
                    });
                }
            }}
            aria-label="Share product"
        >
            {/* Provided Share SVG Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-8 lg:w-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M13.576 17.271l-5.11-2.787a3.5 3.5 0 1 1 0-4.968l5.11-2.787a3.5 3.5 0 1 1 .958 1.755l-5.11 2.787a3.514 3.514 0 0 1 0 1.458l5.11 2.787a3.5 3.5 0 1 1-.958 1.755z" />
            </svg>
        </button>
    );
}
