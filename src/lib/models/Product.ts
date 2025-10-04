import { z } from 'zod';
import { getProductSlug } from '../utils/slugify';

const baseBrandLogoUrl = 'https://firebasestorage.googleapis.com/v0/b/letsridecycles.firebasestorage.app/o/brandLogos';

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
 * - Sets default `inventory` to 1 if not provided
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
  price: z.number().optional(),
  actualPrice: z.number(),
  discountPercentage: z.number().nullable().optional(),
  rating: z.number(),
  shortDescription: z.string().optional(),
  details: z.string().optional(),
  image: z.string().optional(), // Main thumbnail image URL
  images: z.array(z.string()).optional(),
  inventory: z.number().default(1),
  isRecommended: z.boolean().default(false),
  slug: z.string().optional(),
}).transform(product => {
  const roundedDiscountPercentage = product.discountPercentage != null ? Math.floor(product.discountPercentage) : null;
  const discountedPrice = product.price != null
    ? product.price
    : (roundedDiscountPercentage != null
      ? product.actualPrice * (1 - roundedDiscountPercentage / 100)
      : product.actualPrice);

  return {
    ...product,
    brandLogo: product.brand
      ? `${baseBrandLogoUrl}%2F${product.brand.toLowerCase().replace(/\s+/g, '-')}.png?alt=media`
      : `${baseBrandLogoUrl}%2Fdefault.png?alt=media`,
    discountedPrice,
    roundedDiscountPercentage,
    slug: product.slug || getProductSlug(product.name),
  };
});

/**
 * Product type inferred from ProductSchema.
 * 
 * **Computed Fields:**
 * - `discountedPrice`: Calculated from price and discountPercentage, or stored directly
 * - `brandLogo`: Generated URL for brand logo image
 * 
 * **Field Descriptions:**
 * - `id`: Unique identifier (Firestore document ID)
 * - `name`: Product display name
 * - `category`: Top-level category (e.g., "Bikes", "Accessories")
 * - `subCategory`: Specific subcategory (e.g., "Mountain", "Road")
 * - `brand`: Manufacturer name (optional)
 * - `price`: Final price after discount (computed or stored) 
 * - `actualPrice`: Original price in currency units
 * - `discountPercentage`: Discount as percentage (0-100, null for no discount)
 * - `rating`: Product rating (typically 0-5 scale)
 * - `shortDescription`: Brief product summary
 * - `details`: Full product description
 * - `image`: Main thumbnail image URL (single image for display)
 * - `images`: Array of additional product image URLs
 * - `inventory`: Stock count/quantity available
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
 *   discountedPrice: 1080, // Computed or stored
 *   discountPercentage: 10,
 *   rating: 4.5,
 *   inventory: 15,
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