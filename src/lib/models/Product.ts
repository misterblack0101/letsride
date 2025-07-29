import { z } from 'zod';

const baseBrandLogoUrl = 'https://yourcdn.com/brands';

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

export type Product = z.infer<typeof ProductSchema>;

//Accessories:Bags,Lights,Fenders,Phone Case/Mount
// Apparels :"Topwear, Bottomwear, Footwear,Helmet,Eyewear,Gloves"
// Bikes :"Mountain,Hybrid,Road,Gravel"
// Kids :"Tricycles,Electric Car/Bike,Ride-Ons, Prams,Baby Swing,Baby Essentials"
// Spares :"Braking System, Tyres & Tubes, Pedals, Saddles, Grips, Gear systems