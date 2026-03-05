import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import createMiddleware from 'next-intl/middleware';
import { routing, countryLocaleMap } from '@/lib/i18n/routing';

// ── i18n middleware (handles locale detection + redirects) ──
const intlMiddleware = createMiddleware(routing);

// Cookie name used by next-intl to persist user's locale choice
const LOCALE_COOKIE = 'NEXT_LOCALE';

// ── Auth constants ──────────────────────────────
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
);
const ADMIN_COOKIE = 'wac-auth-token';

// API routes that are always public (no auth needed for any method)
const publicApiPrefixes = [
    '/api/auth',
    '/api/chat',
    '/api/visitor',
    '/api/marketing',
    '/api/customer/register',
    '/api/customer/login',
    '/api/customer/forgot-password',
    '/api/payments/webhook', // Midtrans webhook — uses signature verification
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

function isAdminRoute(pathname: string): boolean {
    // Match /en/admin, /id/admin, /admin (before locale redirect)
    return routing.locales.some(l =>
        pathname === `/${l}/admin` || pathname.startsWith(`/${l}/admin/`)
    ) || pathname === '/admin' || pathname.startsWith('/admin/');
}

function extractLocale(pathname: string): string {
    const match = routing.locales.find(l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`);
    return match || routing.defaultLocale;
}

// ── API auth handler ──────────────────────────
async function handleApiAuth(req: NextRequest): Promise<NextResponse> {
    const pathname = req.nextUrl.pathname;

    // Always allow public APIs
    if (isPublicApi(pathname)) {
        return NextResponse.next();
    }

    const method = req.method;

    // GET requests to content endpoints are public (the website needs them)
    // Exception: GET /api/leads is admin-only (viewing submitted leads)
    if (method === 'GET' && !pathname.startsWith('/api/leads') && !pathname.startsWith('/api/admin') && !pathname.startsWith('/api/portal')) {
        return NextResponse.next();
    }

    // Public POST routes (contact form, newsletter)
    if (isPublicPost(pathname, method)) {
        return NextResponse.next();
    }

    // Portal and payment routes use customer auth (handled in route handlers via requireCustomer)
    if (pathname.startsWith('/api/portal') || pathname.startsWith('/api/payments') || pathname.startsWith('/api/customer')) {
        return NextResponse.next();
    }

    // Admin API routes require admin auth
    const valid = await verifyAdminAuth(req);
    if (!valid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
}

// ── Main middleware ─────────────────────────────
export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // API routes bypass locale handling, apply auth
    if (pathname.startsWith('/api/')) {
        return handleApiAuth(req);
    }

    // Admin page — let it load and handle its own auth (has built-in login form)
    // API routes under /api/admin/* are still protected by handleApiAuth above

    // ── Geographic locale detection ──────────────
    // If no locale cookie is set (first visit), check geo headers to determine locale
    // Priority: cookie > URL locale prefix > geo header > Accept-Language > default
    const hasLocaleCookie = req.cookies.has(LOCALE_COOKIE);
    const hasLocalePrefix = routing.locales.some(l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`);

    if (!hasLocaleCookie && !hasLocalePrefix) {
        // Check geo headers from hosting platforms (Vercel, Cloudflare, Hostinger)
        // Vercel, Cloudflare, and nginx (via GeoIP module) all provide country headers
        const country =
            req.headers.get('x-vercel-ip-country') ||
            req.headers.get('cf-ipcountry') ||
            req.headers.get('x-country-code') ||
            '';

        const geoLocale = countryLocaleMap[country.toUpperCase()];

        if (geoLocale && geoLocale !== routing.defaultLocale) {
            // Redirect to geo-detected locale and set cookie to persist choice
            const url = req.nextUrl.clone();
            url.pathname = `/${geoLocale}${pathname}`;
            const response = NextResponse.redirect(url);
            response.cookies.set(LOCALE_COOKIE, geoLocale, {
                path: '/',
                maxAge: 60 * 60 * 24 * 365, // 1 year
            });
            return response;
        }
    }

    // All page routes go through i18n middleware (locale detection + redirect)
    return intlMiddleware(req);
}

export const config = {
    matcher: [
        // Match all page routes (for i18n locale handling)
        '/((?!api|_next|_vercel|.*\\..*).*)',
        // Match API routes (for auth protection)
        '/api/:path*',
    ],
};
