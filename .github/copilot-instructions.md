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
npm run dev              # Next.js dev
npm run genkit:dev       # AI development server (Genkit)
npm run genkit:watch     # AI server with watch mode
```

## Critical Patterns

### Firebase Dual Database Pattern
- **Products**: stored in Firestore and queried server-side via `src/lib/server/products.server.ts` (uses `adminDb`)
- **Categories**: stored in Realtime DB as CSV strings, parsed in `getSubcategoriesFromDB()`

### Server/Client Component Split (important change)
- Server-only product logic lives in `src/lib/server/*.server.ts` and is imported only by server components and API routes.
- Client code should import `src/lib/services/products.ts` which uses `fetch()` to call API endpoints. This prevents `firebase-admin` from being bundled into the browser.

## Data Fetching & Sorting (how it works now)
- Client UI (e.g. `ProductSort`) updates a sort key.
- Client code calls `src/lib/services/products.ts` which issues `fetch()` to `/api/products` or `/api/products/category/:cat/:subcat`.
- API routes call `src/lib/server/products.server.ts` which executes Firestore `where`, `orderBy`, `limit`, and `startAfter` using the Admin SDK and returns JSON.
- Server components can import `products.server` directly (SSR) to avoid extra network roundtrips.

## Security & Hardening Notes
- Never import `firebase-admin` from client code. Use the client-safe wrappers or API routes.
- Server module `src/lib/server/products.server.ts` includes a runtime guard that throws if imported in a browser — fail-fast.
- Create Firestore composite indexes when runtime errors show missing indexes for `where` + `orderBy` combos.

## Development Guidelines (high level)
- Default to Server Components in `app/` for data fetching.
- Only use Client Components when needed (`'use client'`).
- Always pass server-fetched data into client components as props for initial render.

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
- Simple cookie-based admin auth (hardcoded: `lala/lala`)
