import { NextResponse } from 'next/server';

// const ADMIN_ID = process.env.ADMIN_ID || 'admin';
// const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'securepassword';
const ADMIN_ID = 'babayaga';
const ADMIN_PASSWORD = 'lala49';

export async function POST(request: Request) {
    try {
        const { id, password } = await request.json();

        if (id === ADMIN_ID && password === ADMIN_PASSWORD) {
            const response = NextResponse.json({ success: true });
            response.cookies.set('auth', 'true', { httpOnly: true, path: '/', maxAge: 60 * 60 * 240 });
            return response;
        } else {
            return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: 'An error occurred' }, { status: 500 });
    }
}
