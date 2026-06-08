import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
);
const ADMIN_COOKIE = 'wac-auth-token';

const publicApiPrefixes = [
    '/api/auth',
    '/api/chat',
    '/api/visitor',
    '/api/marketing',
    '/api/customer/register',
    '/api/customer/login',
    '/api/customer/forgot-password',
    '/api/payments/webhook',
];

const publicPostRoutes = ['/api/leads'];

function isPublicApi(pathname: string): boolean {
    return publicApiPrefixes.some(prefix => pathname.startsWith(prefix));
}

function isPublicPost(pathname: string, method: string): boolean {
    return method === 'POST' && publicPostRoutes.some(route => pathname === route);
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

    if (
        method === 'GET' &&
        !pathname.startsWith('/api/leads') &&
        !pathname.startsWith('/api/admin') &&
        !pathname.startsWith('/api/portal')
    ) {
        return NextResponse.next();
    }

    if (isPublicPost(pathname, method)) return NextResponse.next();

    if (
        pathname.startsWith('/api/portal') ||
        pathname.startsWith('/api/payments') ||
        pathname.startsWith('/api/customer')
    ) {
        return NextResponse.next();
    }

    const valid = await verifyAdminAuth(req);
    if (!valid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
}

// App-surface page prefixes that must never be indexed. These are the
// authenticated/transactional routes that will move to app.wearecollaborative.net
// (non-indexed) in Phase 2. Until then they live on the apex, so we stamp them
// noindex at the edge — mirrors apps/ci/src/proxy.ts. robots.ts + per-route
// metadata are the other two layers (search engines honor any of them).
// (Next 16 renamed the `middleware` file convention to `proxy`.)
const NOINDEX_PAGE_PREFIXES = [
    '/admin',
    '/dashboard',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/checkout',
];

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // API auth gating (JWT verification stays strictly in this branch so page
    // requests below never pay for a crypto check).
    if (pathname.startsWith('/api/')) return handleApiAuth(req);

    // App-surface pages: add noindex header, otherwise pass through untouched.
    if (NOINDEX_PAGE_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
        const res = NextResponse.next();
        res.headers.set('X-Robots-Tag', 'noindex, nofollow');
        return res;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // API auth gating
        '/api/admin/:path*',
        '/api/portal/:path*',
        '/api/customer/me',
        '/api/customer/logout',
        '/api/leads',
        '/api/leads/:path*',
        '/api/sections/:path*',
        '/api/payments/create-transaction',
        '/api/payments/status',
        '/api/:path*/[id]/seo',
        // App-surface pages → noindex header (Phase 1 SEO boundary)
        '/admin/:path*',
        '/dashboard/:path*',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password/:path*',
        '/checkout/:path*',
    ],
};
