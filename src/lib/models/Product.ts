import { z } from 'zod';

const baseBrandLogoUrl = 'https://yourcdn.com/brands';

/**
 * Zod schema for product data validation and transformation.
 * 
 * **Validation Rules:**
 * - All required fields must be present and valid
 * - Price and rating must be numbers
 * - Optional fields can be undefined or null
 * - Images array is optional for products without photos
 * 
 * **Transformations Applied:**
 * - Calculates `discountedPrice` from price and discount percentage
 * - Generates `brandLogo` URL based on brand name
 * - Sets default `isRecommended` to false
 * 
 * **Usage:**
 * - Use `ProductSchema.parse()` for validation with errors
 * - Use `ProductSchema.safeParse()` for validation without throwing
 * 
 * @example
 * ```typescript
 * const rawProduct = { id: '1', name: 'Bike', price: 100, ... };
 * const result = ProductSchema.safeParse(rawProduct);
 * if (result.success) {
 *   const product = result.data; // Has discountedPrice and brandLogo
 * }
 * ```
 */
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  subCategory: z.string(),
  brand: z.string().optional(),
  price: z.number(),
  discountPercentage: z.number().nullable().optional(),
  rating: z.number(),
  shortDescription: z.string().optional(),
  details: z.string().optional(),
  images: z.array(z.string()).optional(),
  isRecommended: z.boolean().default(false),
}).transform(product => {
  const discountedPrice = product.discountPercentage != null
    ? product.price * (1 - product.discountPercentage / 100)
    : product.price;

  return {
    ...product,
    brandLogo: product.brand
      ? `${baseBrandLogoUrl}/${product.brand.toLowerCase().replace(/\s+/g, '-')}.png`
      : `${baseBrandLogoUrl}/default.png`,
    discountedPrice,
  };
});

/**
 * Product type inferred from ProductSchema.
 * 
 * **Computed Fields:**
 * - `discountedPrice`: Calculated from price and discountPercentage
 * - `brandLogo`: Generated URL for brand logo image
 * 
 * **Field Descriptions:**
 * - `id`: Unique identifier (Firestore document ID)
 * - `name`: Product display name
 * - `category`: Top-level category (e.g., "Bikes", "Accessories")
 * - `subCategory`: Specific subcategory (e.g., "Mountain", "Road")
 * - `brand`: Manufacturer name (optional)
 * - `price`: Original price in currency units
 * - `discountPercentage`: Discount as percentage (0-100, null for no discount)
 * - `rating`: Product rating (typically 0-5 scale)
 * - `shortDescription`: Brief product summary
 * - `details`: Full product description
 * - `images`: Array of image URLs
 * - `isRecommended`: Whether product appears in recommendation sections
 * 
 * @example
 * ```typescript
 * const product: Product = {
 *   id: 'bike-123',
 *   name: 'Mountain Bike Pro',
 *   category: 'Bikes',
 *   subCategory: 'Mountain',
 *   brand: 'Trek',
 *   price: 1200,
 *   discountPercentage: 10,
 *   discountedPrice: 1080, // Computed
 *   rating: 4.5,
 *   brandLogo: 'https://yourcdn.com/brands/trek.png', // Computed
 *   isRecommended: false
 * };
 * ```
 */
export type Product = z.infer<typeof ProductSchema>;

//Accessories:Bags,Lights,Fenders,Phone Case/Mount
// Apparels :"Topwear, Bottomwear, Footwear,Helmet,Eyewear,Gloves"
// Bikes :"Mountain,Hybrid,Road,Gravel"
// Kids :"Tricycles,Electric Car/Bike,Ride-Ons, Prams,Baby Swing,Baby Essentials"
// Spares :"Braking System, Tyres & Tubes, Pedals, Saddles, Grips, Gear systems