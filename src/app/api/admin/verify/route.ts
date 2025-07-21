import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {

    const authCookie = req.cookies.get('session');

    if (!authCookie) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        // return NextResponse.redirect(new URL('/admin/LoginForm', req.nextUrl));
    }

    return NextResponse.json({ message: 'Login successful' }, { status: 200 });

}
