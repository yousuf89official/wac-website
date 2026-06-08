import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// GET /api/whitelabel — List user's white-label domains
export async function GET() {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const isAdmin = ['admin', 'super_admin', 'masteradmin'].includes(session!.user.role?.toLowerCase());

        const domains = await prisma.whitelabelDomain.findMany({
            where: isAdmin ? {} : { userId: session!.user.id },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(domains);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
    }
}

// POST /api/whitelabel — Create a new white-label domain
export async function POST(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const body = await request.json();
        const { domain, brandName, logo, primaryColor, accentColor, loginMessage } = body;

        if (!domain || !brandName) {
            return NextResponse.json({ error: 'domain and brandName are required' }, { status: 400 });
        }

        // Validate domain format
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
        if (!domainRegex.test(domain)) {
            return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
        }

        // Check for duplicate
        const existing = await prisma.whitelabelDomain.findUnique({ where: { domain } });
        if (existing) {
            return NextResponse.json({ error: 'Domain already registered' }, { status: 409 });
        }

        const wl = await prisma.whitelabelDomain.create({
            data: {
                domain: domain.toLowerCase(),
                userId: session!.user.id,
                brandName,
                logo: logo || null,
                primaryColor: primaryColor || '#0D9488',
                accentColor: accentColor || '#0EA5E9',
                loginMessage: loginMessage || null,
            },
        });

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'User',
            userEmail: session!.user.email || '',
            action: 'create',
            target: 'WhitelabelDomain',
            detail: `Created white-label domain: ${domain} (${brandName})`,
        });

        return NextResponse.json(wl);
    } catch (err: any) {
        console.error('Whitelabel create error:', err);
        return NextResponse.json({ error: err.message || 'Failed to create domain' }, { status: 500 });
    }
}
