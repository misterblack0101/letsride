import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware for Route Protection
 * 
 * **Architecture:**
 * - Firebase authentication is client-side only (browser)
 * - Admin route protection happens via client components (useAuth hook)
 * - API routes protected via Firebase Admin SDK token verification
 * 
 * **Note:**
 * - This middleware currently allows all /admin/* routes through
 * - Actual authentication checks happen in client components
 * - Unauthenticated users are redirected to / by useAuth hook in components
 * 
 * **Future Enhancement:**
 * - Could add server-side session cookies for SSR auth
 * - Would require Firebase session cookie creation on login
 */

export default async function middleware(req: NextRequest) {
    // Admin routes are protected by client-side auth checks in components
    // API routes are protected by Firebase Admin SDK token verification
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
