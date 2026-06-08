import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Backend (app.wearecollaborative.net) API auth gating.
 *
 * This app owns auth + customer portal + admin CMS + checkout/payments, so the
 * JWT gating that used to live on the apex lives here now. Page noindex is
 * handled globally via next.config headers (the whole app is non-indexed).
 * (Next 16 renamed the `middleware` file convention to `proxy`.)
 */

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
);
const ADMIN_COOKIE = 'wac-auth-token';

const publicApiPrefixes = [
    '/api/auth',
    '/api/content',
    '/api/health',
    '/api/customer/register',
    '/api/customer/login',
    '/api/customer/forgot-password',
    '/api/payments/webhook',
];

function isPublicApi(pathname: string): boolean {
    return publicApiPrefixes.some(prefix => pathname.startsWith(prefix));
}

async function verifyAdminAuth(req: NextRequest): Promise<boolean> {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) return false;
    try {
        await jwtVerify(token, JWT_SECRET);
        return true;
    } catch {
        return false;
    }
}

async function handleApiAuth(req: NextRequest): Promise<NextResponse> {
    const pathname = req.nextUrl.pathname;

    if (isPublicApi(pathname)) return NextResponse.next();

    const method = req.method;

    // Public content reads (GET) — except admin-only listings.
    if (
        method === 'GET' &&
        !pathname.startsWith('/api/leads') &&
        !pathname.startsWith('/api/admin') &&
        !pathname.startsWith('/api/portal')
    ) {
        return NextResponse.next();
    }

    // Customer-scoped routes verify the customer token in their own handlers.
    if (
        pathname.startsWith('/api/portal') ||
        pathname.startsWith('/api/payments') ||
        pathname.startsWith('/api/customer')
    ) {
        return NextResponse.next();
    }

    // Everything else (admin writes, lead/admin listings) requires the admin JWT.
    const valid = await verifyAdminAuth(req);
    if (!valid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
}

export async function proxy(req: NextRequest) {
    if (req.nextUrl.pathname.startsWith('/api/')) return handleApiAuth(req);
    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*'],
};
