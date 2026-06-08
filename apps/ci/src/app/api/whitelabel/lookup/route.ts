import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/whitelabel/lookup?domain=X — Public: get portal config for a domain
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const domain = searchParams.get('domain')?.toLowerCase();

        if (!domain) {
            return NextResponse.json({ error: 'domain parameter required' }, { status: 400 });
        }

        const wl = await prisma.whitelabelDomain.findUnique({
            where: { domain },
            select: {
                brandName: true,
                logo: true,
                primaryColor: true,
                accentColor: true,
                loginMessage: true,
                customCss: true,
                isActive: true,
            },
        });

        if (!wl || !wl.isActive) {
            return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
        }

        return NextResponse.json({
            brandName: wl.brandName,
            logo: wl.logo,
            primaryColor: wl.primaryColor,
            accentColor: wl.accentColor,
            loginMessage: wl.loginMessage,
            customCss: wl.customCss,
        });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to lookup domain' }, { status: 500 });
    }
}
