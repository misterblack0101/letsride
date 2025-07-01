export type Product = {
  id: string;
  name: string;
  type: 'Cycle' | 'Accessory' | 'Gear' | 'Toy';
  category: string;
  brand: string;
  price: number;
  rating: number;
  popularity: number;
  image: string;
  description: string;
  details?: string;
  dataAiHint?: string;
};
