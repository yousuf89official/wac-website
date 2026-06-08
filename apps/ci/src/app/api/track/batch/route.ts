import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface TrackedEvent { type: string; path: string; data?: Record<string, unknown>; timestamp: number; }

function parseUA(ua: string) {
    let deviceType = 'desktop';
    if (/iPad|Tablet/i.test(ua)) deviceType = 'tablet';
    else if (/Mobile|Android.*Mobile|iPhone/i.test(ua)) deviceType = 'mobile';

    let browser = 'Unknown';
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
    else if (/Firefox\//i.test(ua)) browser = 'Firefox';
    else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';

    let os = 'Unknown';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua)) os = 'macOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Linux/i.test(ua)) os = 'Linux';

    return { deviceType, browser, os };
}

// IP geo cache
const GEO_CACHE = new Map<string, { country: string | null; city: string | null; ts: number }>();
let geoFails = 0;
let geoCircuitUntil = 0;

async function geolocate(ip: string): Promise<{ country: string | null; city: string | null }> {
    if (!ip || ip === '127.0.0.1' || ip === '::1') return { country: null, city: null };
    const cached = GEO_CACHE.get(ip);
    if (cached && Date.now() - cached.ts < 86400000) return { country: cached.country, city: cached.city };
    if (Date.now() < geoCircuitUntil) return { country: null, city: null };

    try {
        const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`, { signal: AbortSignal.timeout(2000) });
        if (!res.ok) { geoFails++; if (geoFails >= 3) { geoCircuitUntil = Date.now() + 300000; geoFails = 0; } return { country: null, city: null }; }
        const data = await res.json();
        const result = { country: data.country || null, city: data.city || null };
        geoFails = 0;
        if (GEO_CACHE.size >= 1000) GEO_CACHE.delete(GEO_CACHE.keys().next().value!);
        GEO_CACHE.set(ip, { ...result, ts: Date.now() });
        return result;
    } catch { geoFails++; if (geoFails >= 3) { geoCircuitUntil = Date.now() + 300000; geoFails = 0; } return { country: null, city: null }; }
}

export async function POST(req: NextRequest) {
    try {
        const { events, sessionId, visitorId }: { events: TrackedEvent[]; sessionId?: string; visitorId?: string } = await req.json();
        if (!events || !Array.isArray(events) || events.length === 0) return NextResponse.json({ ok: true });
        if (events.length > 500) return NextResponse.json({ ok: false, error: 'Too many events' }, { status: 400 });

        // 1. Batch insert behavior events
        await prisma.behaviorEvent.createMany({
            data: events.map(e => ({
                sessionId: sessionId || 'unknown', visitorId: visitorId || null,
                type: e.type, path: e.path,
                data: e.data ? JSON.stringify(e.data) : null,
                createdAt: new Date(e.timestamp),
            })),
        });

        const pageviews = events.filter(e => e.type === 'pageview');
        const sessionEnd = events.find(e => e.type === 'session_end');
        const duration = sessionEnd?.data?.duration as number | undefined;
        const exitPage = (sessionEnd?.data?.exitPage as string) || null;

        const firstPv = pageviews[0]?.data;
        const ua = (firstPv?.userAgent as string) || req.headers.get('user-agent') || '';
        const { deviceType, browser, os } = parseUA(ua);

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null;
        const geoPromise = ip ? geolocate(ip) : Promise.resolve({ country: null, city: null });

        await Promise.all([
            // 2. Session detail
            (async () => {
                if (!sessionId) return;
                const { country, city } = await geoPromise;
                const totalPageCount = pageviews.length;
                await prisma.sessionDetail.upsert({
                    where: { sessionId },
                    create: {
                        sessionId, landingPage: pageviews[0]?.path || '/',
                        exitPage, pageCount: totalPageCount, totalDuration: duration || 0,
                        isBounce: totalPageCount <= 1 && (duration || 0) < 10,
                        lastActivity: new Date(), ip, userAgent: ua, deviceType, browser, os,
                        screenWidth: (firstPv?.screenWidth as number) || null,
                        screenHeight: (firstPv?.screenHeight as number) || null,
                        language: (firstPv?.language as string) || null,
                        country, city,
                        referrer: (firstPv?.referrer as string) || null,
                        utmSource: (firstPv?.utmSource as string) || null,
                        utmMedium: (firstPv?.utmMedium as string) || null,
                        utmCampaign: (firstPv?.utmCampaign as string) || null,
                    },
                    update: {
                        pageCount: { increment: totalPageCount },
                        ...(duration ? { totalDuration: { increment: duration } } : {}),
                        ...(totalPageCount > 1 || (duration || 0) >= 10 ? { isBounce: false } : {}),
                        lastActivity: new Date(),
                        ...(exitPage ? { exitPage } : {}),
                    },
                });
            })(),
            // 3. Audience intelligence
            (async () => {
                if (!sessionId) return;
                const paths = pageviews.map(e => e.path);
                if (paths.length === 0) return;
                const existing = await prisma.audienceIntelligence.findUnique({ where: { sessionId } });
                const history: string[] = existing?.browsingHistory ? JSON.parse(existing.browsingHistory) : [];
                const updated = [...history, ...paths].slice(-50);
                await prisma.audienceIntelligence.upsert({
                    where: { sessionId },
                    create: { sessionId, browsingHistory: JSON.stringify(updated) },
                    update: { browsingHistory: JSON.stringify(updated) },
                });
            })(),
            // 4. Visitor stats
            (async () => {
                if (!visitorId) return;
                const pvCount = pageviews.length;
                const dur = duration || 0;
                if (pvCount > 0 || dur > 0) {
                    await prisma.siteVisitor.update({
                        where: { id: visitorId },
                        data: { totalPageViews: { increment: pvCount }, totalTimeOnSite: { increment: dur }, lastSeen: new Date() },
                    }).catch(() => {});
                }
            })(),
        ]);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Batch track error:', error);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
