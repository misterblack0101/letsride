# Let's Ride Product Filtering Architecture

This document provides a comprehensive overview of the product filtering architecture in the Let's Ride e-commerce platform.

## Architecture Overview

The Let's Ride filtering system uses a **server-side rendering approach with URL-based state management**. This architecture provides the benefits of both server-rendered pages (SEO, performance) and client-side interactivity.

### Key Components

1. **Server-Side Components**:
   - `app/products/page.tsx` 
   - `app/products/[category]/page.tsx`
   - `app/products/[category]/[subcategory]/page.tsx`
   - `lib/server/products.server.ts`

2. **Client-Side Components**:
   - `components/products/ServerProductFilters.tsx` (client component despite the "Server" prefix)
   - `components/products/ServerProductSort.tsx`
   - `components/products/ServerViewToggle.tsx`
   - `components/products/ServerPagination.tsx`

3. **Shared Components**:
   - `components/products/ProductPage.tsx` (main layout)
   - `components/products/ProductGrid.tsx` (display)

## Data Flow

1. **Initial Page Load (SSR)**:
   - User visits a product page (e.g., `/products` or `/products/bikes/mountain`)
   - Next.js server renders the page using the appropriate page component
   - The page component reads URL parameters and passes them to server-side functions
   - `products.server.ts` queries Firestore directly via Firebase Admin SDK
   - The rendered HTML with products is sent to the client

2. **Filter Interaction**:
   - User clicks on a filter option in `ServerProductFilters`
   - The component builds a new URL with updated query parameters
   - `router.push()` navigates to the new URL
   - Next.js performs a new server-side render with the updated parameters
   - New filtered results are rendered server-side and sent to the client

## URL Parameter Structure

Product filtering is primarily driven by URL parameters:

- `category` - Filter by product category
- `brand` - Filter by product brand
- `sort` - Sort order ('name', 'price_low', 'price_high', 'rating')
- `view` - Display mode ('grid' or 'list')
- `page` - Pagination page number
- `lastId` - Cursor ID for pagination

Example: `/products?brand=Trek&sort=price_low&view=grid&page=2`

## Server-Side Filtering Logic

Filtering happens on the server in `products.server.ts` using Firestore queries:

```typescript
// Example from fetchFilteredProducts
if (filters.brands && filters.brands.length > 0) {
  if (filters.brands.length === 1) {
    queryBuilder.where('brand', '==', filters.brands[0]);
  } else {
    queryBuilder.where('brand', 'in', filters.brands);
  }
}

// Apply sorting
if (filters.sortBy) {
  switch (filters.sortBy) {
    case 'name':
      queryBuilder.orderBy('name', 'asc');
      break;
    // Other sort cases...
  }
}
```

## Client-Side Components

Despite the "Server" prefix in component names like `ServerProductFilters`, these are client components (marked with `'use client'`) that manipulate URL parameters rather than maintain local state:

```typescript
// From ServerProductFilters.tsx
const updateURL = (updates: Record<string, string | string[] | null>) => {
  const params = new URLSearchParams(searchParams);
  // Update parameters...
  router.push(`${baseUrl}?${params.toString()}`);
};
```

## Pagination

The system uses cursor-based pagination for efficiency:

1. First page: Basic limit query
2. Subsequent pages: Use `startAfter` cursor with the last document from the previous page

## Benefits of this Architecture

1. **SEO Optimization**: All filtered views are fully server rendered
2. **Performance**: No client-side data fetching after initial load
3. **Progressive Enhancement**: Works even without JavaScript
4. **Shareable URLs**: Filter state is in the URL
5. **Server-Side Processing**: Heavy queries run on the server

## Implementation Notes

- Firestore composite indexes are required for complex filters with sorting
- Category and brand filters can be combined
- The architecture follows Next.js App Router patterns
- Server Components directly access server-side functions