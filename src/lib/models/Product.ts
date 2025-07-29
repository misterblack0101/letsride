import { z } from 'zod';

const baseBrandLogoUrl = 'https://yourcdn.com/brands';

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  subCategory: z.string(),
  brand: z.string().optional(),
  price: z.number(),
  discountPercentage: z.number().optional(),
  rating: z.number(),
  shortDescription: z.string().optional(),
  details: z.string().optional(),
  images: z.array(z.string()).optional(),
}).transform(product => ({
  ...product,
  brandLogo: product.brand
    ? `${baseBrandLogoUrl}/${product.brand.toLowerCase().replace(/\s+/g, '-')}.png`
    : `${baseBrandLogoUrl}/default.png`,
  // /images/bicycle_no_bg.png
}));

export type Product = z.infer<typeof ProductSchema>;
