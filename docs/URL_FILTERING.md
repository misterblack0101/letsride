# URL-Based Filtering Documentation

## Overview
The products page now supports URL-based filtering and sorting, making all filter states shareable via URLs.

## URL Structure
```
/products?[parameters]
```

## Supported Parameters

### Filtering
- `category` - Filter by product category (can be multiple)
- `brand` - Filter by brand (can be multiple)  
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter

### Sorting
- `sort` - Sort products by:
  - `popularity` (default)
  - `name` (A-Z)
  - `price_low` (Low to High)
  - `price_high` (High to Low)
  - `rating` (Highest first)

### Display
- `view` - Display mode:
  - `grid` (default)
  - `list`

## Example URLs

### Basic filtering
```
/products?category=bicycles
/products?brand=trek&brand=specialized
/products?category=accessories&minPrice=1000&maxPrice=5000
```

### Combined filters
```
/products?category=bicycles&brand=trek&sort=price_low&view=list
/products?category=accessories&category=gear&minPrice=500&sort=rating
```

### Multiple categories/brands
```
/products?category=bicycles&category=accessories&brand=trek&brand=giant
```

## Benefits

1. **Shareable URLs** - Users can share filtered search results
2. **SEO Friendly** - Search engines can index filtered pages
3. **Browser History** - Back/forward navigation works with filters
4. **Bookmarkable** - Users can bookmark specific filter combinations
5. **Server-Side Rendering** - All filtering happens on the server for better performance and security
6. **Fast Performance** - Optimized Firestore queries when possible

## Technical Implementation

- **SSR-First**: All filtering and sorting happens server-side
- **URL State Management**: Using Next.js `searchParams` and `useRouter`
- **Optimized Queries**: Firestore queries optimized for single category/brand filters
- **Type Safety**: Full TypeScript support for all parameters
- **Dynamic Metadata**: SEO metadata generated based on active filters
