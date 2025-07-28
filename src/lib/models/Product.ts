import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['Cycle', 'Accessory', 'Gear', 'Toy']),
  category: z.string(),
  brand: z.string(),
  price: z.number(),
  rating: z.number(),
  popularity: z.number(),
  image: z.string(),
  description: z.string(),
  details: z.string().optional(),
  dataAiHint: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;
