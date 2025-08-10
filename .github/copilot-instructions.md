# Let's Ride Codebase Instructions

## Architecture Overview

This is a **Next.js 15** e-commerce platform for cycling products with dual Firebase backends:
- **Firestore** (via Firebase Admin SDK) for product data
- **Realtime Database** for category/subcategory metadata  
- **Google AI (Gemini)** integration for product recommendations (via Genkit)

### Key Service Boundaries
- `/src/lib/services/products.ts` - All product CRUD operations using Firestore
- `/src/lib/services/categories.ts` - Category data from Realtime DB with React cache
- `/src/lib/firebase/admin.ts` - Server-side Firebase Admin initialization
- `/src/context/cart-context.tsx` - Client-side cart state with localStorage persistence

## Development Setup

**Required Environment Variables:**
```bash
# Firebase (client-side - NEXT_PUBLIC_ prefix required)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=letsridecycles
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# etc.

# Firebase Admin (server-side - NO prefix)
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...

# Google AI
GOOGLE_GENAI_API_KEY=...
```

**Development Commands:**
```bash
npm run dev              # Next.js on port 9002 with Turbopack
npm run genkit:dev       # AI development server (Genkit)
npm run genkit:watch     # AI server with watch mode
```

## Critical Patterns

### Firebase Dual Database Pattern
- **Products**: Stored in Firestore collections, accessed via `adminDb` from admin.ts
- **Categories**: Stored in Realtime DB as CSV strings, parsed in `getSubcategoriesFromDB()`
- **Why**: Categories are simple metadata, products need complex querying

### Server/Client Component Split
- **Server**: `src/app/products/page.tsx` fetches initial data
- **Client**: `src/app/products/ClientProducts.tsx` handles filtering/sorting
- **Pattern**: Server components fetch data, client components manage state

## Development Guidelines

### Next.js Component Strategy
- **Default to Server Components** in `app/` directory for all new components
- **Only use Client Components** with `'use client'` directive when:
  - Using React hooks like `useState`, `useEffect`, `useRouter`
  - Requiring DOM interactions or browser APIs
  - Managing client-side state or event handlers

### Data Fetching Patterns
- **Server Components**: Use `fetch()` or direct database calls (see `services/` folder)
- **Avoid `useEffect`** for data fetching - leverage Server Components instead
- **Client Components**: Only fetch data when user interactions require it

### TypeScript Standards
- **Enforce interfaces and types** for all component props and state
- **Define explicit types** for API responses and database models
- **Use Zod schemas** for runtime validation (see `Product.ts` model)

### Layout Architecture
- **Nest `layout.tsx` files** for consistent UI across route sections
- **Global providers** in root layout (see `CartProvider` example)
- **Section-specific layouts** for admin, products, etc.

### Async Operations
- **Prefer `async/await`** over Promise chains
- **Add appropriate error handling** with try/catch blocks
- **Implement UI loading states** using `loading.tsx` files or skeleton components
- **Show user feedback** via toast notifications (existing pattern)

### Route Structure
```
/products                    # All products
/products/[category]/[subcategory]  # Filtered products
/product/[id]               # Single product page
/admin                      # Protected admin area
```

### Authentication & Middleware
- Simple cookie-based admin auth (hardcoded: `lala/lala`)
- `middleware.ts` protects `/admin/*` routes
- Admin APIs in `/src/app/api/admin/`

## Component Architecture

### Product Components
- `ProductGrid.tsx` - Display logic only
- `ProductFilters.tsx` - Client-side filtering UI
- `ServerProductFilters.tsx` - Server-side filtering wrapper
- **Pattern**: Server components wrap client components for data fetching

### Layout Components
- `Header.tsx` (server) wraps `HeaderClient.tsx` (client)
- `MegaMenu.tsx` builds navigation from category data
- Mobile-first responsive design with `use-mobile.tsx` hook

## Data Flow Patterns

### Product Filtering
1. Server: `fetchFilteredProducts()` with ProductFilterOptions
2. Client: State management in `ClientProducts.tsx`
3. URL params sync for filters (category/subcategory routing)

### Cart Management
- Global state via React Context (`CartProvider`)
- Automatic localStorage persistence
- Toast notifications for user feedback

## AI Integration (Currently Disabled)

- Genkit setup exists but AI features return placeholder errors
- `gear-recommendations-client.ts` has infrastructure for external AI APIs
- Admin panel includes recommendation flags in product model

## Build Configuration

- **Next.js 15** with Turbopack for development
- TypeScript with `ignoreBuildErrors: true` (legacy)
- Image optimization disabled for static export compatibility
- Trailing slashes enabled, custom `dist` directory

## Testing Strategy

No test framework currently configured. When adding tests:
- Use `/src/lib/services/` for business logic testing
- Mock Firebase Admin SDK calls
- Test cart context state management

## Key Files to Reference

- `src/lib/models/Product.ts` - Zod schema with computed fields
- `src/lib/firebase/admin.ts` - Firebase initialization pattern
- `middleware.ts` - Route protection example
- `src/app/layout.tsx` - Global providers setup
