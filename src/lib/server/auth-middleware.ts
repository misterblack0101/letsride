import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

/**
 * Server-side Firebase Auth verification middleware for API routes.
 * 
 * **Usage:**
 * ```typescript
 * import { verifyAuthToken } from '@/lib/server/auth-middleware';
 * 
 * export async function GET(req: NextRequest) {
 *   const authResult = await verifyAuthToken(req);
 *   if (!authResult.authenticated) {
 *     return authResult.response; // Returns 401 Unauthorized
 *   }
 *   
 *   const uid = authResult.uid;
 *   // ... proceed with authenticated request
 * }
 * ```
 * 
 * **Authentication Flow:**
 * 1. Extract token from Authorization header (Bearer token)
 * 2. Verify token using Firebase Admin SDK
 * 3. Return user ID if valid, or error response if invalid
 * 
 * **Security:**
 * - Uses Firebase Admin SDK for server-side verification
 * - Validates token signature and expiration
 * - Returns detailed error messages for debugging
 */

export interface AuthResult {
    authenticated: boolean;
    uid?: string;
    response?: NextResponse;
}

/**
 * Verify Firebase ID token from Authorization header
 * 
 * @param req - Next.js request object
 * @returns AuthResult with authentication status and user ID
 */
export async function verifyAuthToken(req: NextRequest): Promise<AuthResult> {
    try {
        const authHeader = req.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                authenticated: false,
                response: NextResponse.json(
                    { error: 'Unauthorized: Missing or invalid Authorization header' },
                    { status: 401 }
                ),
            };
        }

        const token = authHeader.split('Bearer ')[1];

        if (!token) {
            return {
                authenticated: false,
                response: NextResponse.json(
                    { error: 'Unauthorized: No token provided' },
                    { status: 401 }
                ),
            };
        }

        // Verify the token using Firebase Admin SDK
        const decodedToken = await adminAuth.verifyIdToken(token);

        return {
            authenticated: true,
            uid: decodedToken.uid,
        };
    } catch (error: any) {
        console.error('Auth token verification error:', error);

        let errorMessage = 'Unauthorized: Invalid token';

        if (error.code === 'auth/id-token-expired') {
            errorMessage = 'Unauthorized: Token expired';
        } else if (error.code === 'auth/id-token-revoked') {
            errorMessage = 'Unauthorized: Token revoked';
        } else if (error.code === 'auth/argument-error') {
            errorMessage = 'Unauthorized: Invalid token format';
        }

        return {
            authenticated: false,
            response: NextResponse.json(
                { error: errorMessage },
                { status: 401 }
            ),
        };
    }
}

/**
 * Verify auth token and optionally check if user is admin
 * (You can extend this later to check custom claims or Firestore for admin status)
 */
export async function verifyAdminAuth(req: NextRequest): Promise<AuthResult> {
    const authResult = await verifyAuthToken(req);

    if (!authResult.authenticated) {
        return authResult;
    }

    // For now, any authenticated user is considered admin
    // TODO: Add custom claims or Firestore check for admin role
    // const isAdmin = await checkAdminStatus(authResult.uid);
    // if (!isAdmin) {
    //   return {
    //     authenticated: false,
    //     response: NextResponse.json(
    //       { error: 'Forbidden: Admin access required' },
    //       { status: 403 }
    //     ),
    //   };
    // }

    return authResult;
}
