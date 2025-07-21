import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
    const protectedRoutes = ['/admin'];
    const path = req.nextUrl.pathname;

    // Check if the current route is protected
    if (protectedRoutes.includes(path)) {
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? JSON.parse(cookie) : null;

        // Redirect to login if no valid session is found
        if (!session || session.role !== 'admin') {
            return NextResponse.redirect(new URL('/admin/LoginForm', req.nextUrl));
        }
    }

    // Allow access to other routes
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
