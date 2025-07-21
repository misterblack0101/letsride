import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
    if (req.method !== 'POST') {
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const { id, password } = await req.json();

    // Replace this with your actual authentication logic
    if (id === 'lala' && password === 'lala') {
        const sessionData = { userId: 1, role: 'admin' };
        const cookie = serialize('session', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });
        response.headers.set('Set-Cookie', cookie);
        return response;
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
