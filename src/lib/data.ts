import type { Product } from './types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Mountain Conqueror X2',
    type: 'Cycle',
    category: 'Mountain',
    brand: 'Ridgeback',
    price: 850.00,
    rating: 4.8,
    popularity: 12,
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'trail mountain bike',
    description: 'Brave the toughest trails with the Mountain Conqueror X2. Built for durability and performance, it features a lightweight aluminum frame and superior suspension.',
    details: 'Frame: Lightweight Aluminum, Suspension: Full-suspension, Gears: 24-speed Shimano, Brakes: Hydraulic Disc Brakes'
  },
  {
    id: '2',
    name: 'Urban Glide Pro',
    type: 'Cycle',
    category: 'Hybrid',
    brand: 'CityScout',
    price: 620.00,
    rating: 4.6,
    popularity: 15,
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'city hybrid bike',
    description: 'The perfect companion for your city commutes and weekend explorations. The Urban Glide Pro offers a comfortable ride with a sleek, modern design.',
    details: 'Frame: Aluminum Alloy, Gears: 8-speed Internal Hub, Brakes: V-Brakes, Includes: Fenders and Rear Rack'
  },
  {
    id: '3',
    name: 'Velocity Racer 5000',
    type: 'Cycle',
    category: 'Road',
    brand: 'Speedster',
    price: 1250.00,
    rating: 4.9,
    popularity: 9,
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'racing road bike',
    description: 'Experience pure speed. The Velocity Racer 5000 is an aerodynamic marvel, designed for competitive racing and serious road cycling enthusiasts.',
    details: 'Frame: Carbon Fiber, Gears: 22-speed Shimano Ultegra, Brakes: Caliper, Weight: 7.5kg'
  },
  {
    id: '4',
    name: 'Kid\'s Sparkle Cruiser',
    type: 'Cycle',
    category: 'Kids',
    brand: 'PlayBike',
    price: 180.00,
    rating: 4.7,
    popularity: 20,
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'pink kids bike',
    description: 'A fun and safe first bike for your little one. The Sparkle Cruiser comes with training wheels and a vibrant design that kids will love.',
    details: 'Frame: Steel, Brakes: Coaster Brake, Size: 16-inch wheels, Includes: Training wheels, basket, and streamers'
  },
  {
    id: '5',
    name: 'Aero-Dynamic Helmet',
    type: 'Accessory',
    category: 'Safety',
    brand: 'SafeGuard',
    price: 75.00,
    rating: 4.9,
    popularity: 25,
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'aerodynamic helmet',
    description: 'Stay safe and stylish with the Aero-Dynamic Helmet. It offers superior protection with a lightweight, ventilated design for maximum comfort.'
  },
  {
    id: '6',
    name: 'All-Terrain Tire Set',
    type: 'Accessory',
    category: 'Parts',
    brand: 'TreadWell',
    price: 90.00,
    rating: 4.5,
    popularity: 11,
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'mountain bike tires',
    description: 'Upgrade your ride with our All-Terrain Tire Set. Designed for grip and durability on a variety of surfaces, from city streets to mountain trails.'
  },
  {
    id: '7',
    name: 'Pro-Rider Cycling Jersey',
    type: 'Gear',
    category: 'Apparel',
    brand: 'CycleWear',
    price: 65.00,
    rating: 4.6,
    popularity: 18,
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'yellow cycling jersey',
    description: 'A high-performance jersey made from moisture-wicking fabric to keep you cool and dry. Features a full-length zipper and three rear pockets.'
  },
  {
    id: '8',
    name: 'Mini Bicycle Model',
    type: 'Toy',
    category: 'Collectibles',
    brand: 'TinyRides',
    price: 25.00,
    rating: 4.8,
    popularity: 7,
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'collectible bicycle model',
    description: 'A detailed die-cast model of a classic road bike. Perfect for collectors and cycling enthusiasts of all ages.'
  },
];

export const brands = [...new Set(products.map(p => p.brand))];
export const types = [...new Set(products.map(p => p.type))];
