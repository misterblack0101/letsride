# Let's Ride Codebase Instructions

## Architecture Overview

This is a **Next.js 15** e-commerce platform for cycling products with dual Firebase backends:
````instructions
# Let's Ride Codebase Instructions

## Architecture Overview

This is a **Next.js 15** e-commerce platform for cycling products with dual Firebase backends:
- **Firestore** (via Firebase Admin SDK) for product data — server-only
- **Realtime Database** for category/subcategory metadata  
- **Google AI (Gemini)** integration for product recommendations (via Genkit)

### Key Service Boundaries (updated)
- `src/lib/server/products.server.ts` - Server-only product queries using `firebase-admin` (do not import from client)
- `src/lib/services/products.ts` - Client-safe wrappers that call API routes (`/api/products`)
- `src/lib/services/categories.ts` - Category data from Realtime DB with React cache
- `src/lib/firebase/admin.ts` - Server-side Firebase Admin initialization

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
npm run dev              # Next.js dev server on port 9002 (with Turbopack)
npm run genkit:dev       # AI development server (Genkit) - requires src/ai/dev.ts setup
npm run genkit:watch     # AI server with watch mode
npm run build            # Production build
npm run typecheck        # TypeScript validation without build
```

## Critical Patterns

### Firebase Database Pattern
- **Products**: stored in Firestore and queried server-side via `src/lib/server/products.server.ts` (uses `adminDb`)
- **Categories**: stored in Firestore with pre-computed structure in `src/lib/services/categories.ts` (uses React cache)
- **Search**: in-memory cache with 5-minute TTL in `src/lib/services/search.ts` to avoid repeated Firestore calls

### Server/Client Component Split (important change)
- Server-only product logic lives in `src/lib/server/*.server.ts` and is imported only by server components and API routes.
- Client code should import `src/lib/services/products.ts` which uses `fetch()` to call API endpoints. This prevents `firebase-admin` from being bundled into the browser.

## Data Fetching & Sorting (how it works now)
- Client UI (e.g. `ProductSort`) updates a sort key.
- Client code calls `src/lib/services/products.ts` which issues `fetch()` to `/api/products` or `/api/products/category/:cat/:subcat`.
- API routes call `src/lib/server/products.server.ts` which executes Firestore `where`, `orderBy`, `limit`, and `startAfter` using the Admin SDK and returns JSON.
- Server components can import `products.server` directly (SSR) to avoid extra network roundtrips.

## Component Architecture Patterns

### Server/Client Component Split
- **Server-first**: Use Server Components by default for data fetching and SEO (e.g., `Header`, `ProductPage`)
- **Client wrappers**: Pattern like `Header` → `HeaderClient` where server component fetches data and passes to client component for interactivity
- **Suspense boundaries**: Wrap dynamic content in `<Suspense>` with skeleton loaders (e.g., `ProductGridSkeleton`)

### State Management
- **Cart**: React Context with localStorage persistence (`src/context/cart-context.tsx`)
- **URL state**: Search params for filters, sorting, pagination via `useSearchParams` and Next.js navigation
- **Toast notifications**: Shadcn/ui toast system integrated with cart actions

### Search & Caching Patterns
- **Product search**: `src/lib/services/search.ts` implements server-side search with 5-minute in-memory cache
- **Category data**: React cache pattern in `src/lib/services/categories.ts` for pre-computed category structures
- **Runtime guards**: Server modules include `typeof window !== 'undefined'` checks to prevent client bundling

## Security & Hardening Notes
- Never import `firebase-admin` from client code. Use the client-safe wrappers or API routes.
- Server module `src/lib/server/products.server.ts` includes a runtime guard that throws if imported in a browser — fail-fast.
- Create Firestore composite indexes when runtime errors show missing indexes for `where` + `orderBy` combos.

## Development Guidelines (high level)
- Default to Server Components in `app/` for data fetching.
- Only use Client Components when needed (`'use client'`).
- Always pass server-fetched data into client components as props for initial render.

## Code Quality Standards (PRODUCTION APP)
- **This is a production application** - maintain professional code quality at all times
- Write clean, readable code with meaningful variable/function names
- Add comments for complex business logic, non-obvious patterns, or architectural decisions
- **No debug code**: Remove console.logs, timers, or temporary debugging code before committing
- Follow TypeScript best practices - use proper typing, avoid `any` when possible
- Implement proper error handling and user-friendly error messages

## Route Structure (unchanged)
```
/products                    # All products (server page uses server module)
/products/[category]/[subcategory]  # Filtered products (server API supports pagination + sort)
/product/[id]               # Single product page
/admin                      # Protected admin area
```

## Testing Strategy
- Use `/src/lib/server/` for tests that need admin SDK (mock admin calls).
- Use `/src/lib/services/` to test client fetch behavior (mock fetch or API routes).

## Key Files to Reference (updated)
- `src/lib/server/products.server.ts` - Server-only product queries (admin)
- `src/lib/services/products.ts` - Client fetch wrappers (calls `/api/products`)
- `src/lib/firebase/admin.ts` - Firebase Admin init (server)
- `src/app/api/products/route.ts` and `src/app/api/products/category/[category]/[subcategory]/route.ts` - API endpoints

````
- `src/context/cart-context.tsx` - Cart state management with localStorage
- `src/lib/services/search.ts` - Server-side search with in-memory caching
- `middleware.ts` - Route protection for admin areas

## Authentication & Admin
- Simple cookie-based admin auth (hardcoded: `lala/lala`)
- Middleware protection on `/admin` routes via session cookies (`middleware.ts`)
