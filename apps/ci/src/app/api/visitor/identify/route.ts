import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { fingerprintHash, sessionId, referrer, landingPage, utmSource, utmMedium, utmCampaign } = await req.json();

        if (!fingerprintHash || !sessionId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const visitor = await prisma.siteVisitor.upsert({
            where: { fingerprintHash },
            create: {
                fingerprintHash, visitCount: 1,
                firstReferrer: referrer || null,
                firstUtmSource: utmSource || null,
                firstUtmMedium: utmMedium || null,
                firstUtmCampaign: utmCampaign || null,
                firstLandingPage: landingPage || null,
            },
            update: { lastSeen: new Date(), visitCount: { increment: 1 } },
        });

        await prisma.visitorSession.upsert({
            where: { sessionId },
            create: { visitorId: visitor.id, sessionId },
            update: {},
        });

        return NextResponse.json({
            visitorId: visitor.id,
            profileStage: visitor.profileStage,
            name: visitor.name,
            visitCount: visitor.visitCount,
        });
    } catch (error) {
        console.error('Visitor identify error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
