import { NextResponse } from 'next/server';

export async function POST() {
    // Clear the login cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('session', '', { maxAge: 0 });
    return response;
}
