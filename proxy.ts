import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Public site (wearecollaborative.net) edge gating.
 *
 * After the Phase-2 extraction, the authenticated app surfaces (auth, dashboard,
 * admin, checkout) and their APIs live in apps/backend. What remains here is the
 * indexed marketing site plus public APIs (content, faqs, chat, leads POST,
 * marketing, visitor). The only privileged endpoint left is the admin lead
 * listing (GET/PUT/DELETE on /api/leads), gated here as defense-in-depth on top
 * of the route handler's own requireAuth. The public lead form POSTs freely.
 * (Next 16 renamed the `middleware` file convention to `proxy`.)
 */

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
);
const ADMIN_COOKIE = 'wac-auth-token';

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

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const method = req.method;

    // Public lead submission stays open; everything else on /api/leads is admin.
    if (pathname === '/api/leads' && method === 'POST') {
        return NextResponse.next();
    }

    const valid = await verifyAdminAuth(req);
    if (!valid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/api/leads', '/api/leads/:path*'],
};
