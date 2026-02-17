import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
);
const COOKIE_NAME = 'wac-auth-token';

// API routes that are always public (no auth needed for any method)
const publicApiPrefixes = [
    '/api/auth',
    '/api/chat',
    '/api/visitor',
    '/api/marketing',
];

// POST endpoints that should stay public for anonymous users
const publicPostRoutes = [
    '/api/leads', // contact form + newsletter popup
];

function isPublicApi(pathname: string): boolean {
    return publicApiPrefixes.some(prefix => pathname.startsWith(prefix));
}

function isPublicPost(pathname: string, method: string): boolean {
    return method === 'POST' && publicPostRoutes.some(route => pathname === route);
}

async function verifyAuth(req: NextRequest): Promise<boolean> {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return false;
    try {
        await jwtVerify(token, JWT_SECRET);
        return true;
    } catch {
        return false;
    }
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ── Admin page protection ────────────────
    if (pathname.startsWith('/admin')) {
        const valid = await verifyAuth(req);
        if (!valid) {
            const response = NextResponse.redirect(new URL('/', req.url));
            response.cookies.delete(COOKIE_NAME);
            return response;
        }
        return NextResponse.next();
    }

    // ── API route protection ─────────────────
    if (pathname.startsWith('/api/')) {
        // Always allow public APIs
        if (isPublicApi(pathname)) {
            return NextResponse.next();
        }

        const method = req.method;

        // GET requests to content endpoints are public (the website needs them)
        // Exception: GET /api/leads is admin-only (viewing submitted leads)
        if (method === 'GET' && !pathname.startsWith('/api/leads') && !pathname.startsWith('/api/admin')) {
            return NextResponse.next();
        }

        // Public POST routes (contact form, newsletter)
        if (isPublicPost(pathname, method)) {
            return NextResponse.next();
        }

        // Everything else (POST/PUT/DELETE content, GET leads, admin) needs auth
        const valid = await verifyAuth(req);
        if (!valid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/:path*',
    ],
};
