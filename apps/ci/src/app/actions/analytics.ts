'use server';

import { prisma } from '@/lib/prisma';
import { cookies, headers } from 'next/headers';

export async function trackClicks(clicks: { path: string; x: number; y: number; elementTag?: string; elementText?: string; elementHref?: string; viewportWidth?: number; viewportHeight?: number }[]) {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('ci_session')?.value || 'unknown';

        await prisma.clickEvent.createMany({
            data: clicks.map(c => ({
                sessionId, path: c.path, x: c.x, y: c.y,
                elementTag: c.elementTag || null,
                elementText: c.elementText?.slice(0, 100) || null,
                elementHref: c.elementHref || null,
                viewportWidth: c.viewportWidth || null,
                viewportHeight: c.viewportHeight || null,
            })),
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to track clicks:', error);
        return { success: false };
    }
}

export async function enrichSession(data: { screenWidth?: number; screenHeight?: number; language?: string; landingPage?: string; referrer?: string }) {
    try {
        const cookieStore = await cookies();
        const headersList = await headers();
        const sessionId = cookieStore.get('ci_session')?.value || 'unknown';

        const userAgent = headersList.get('user-agent') || '';
        const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || headersList.get('x-real-ip') || null;
        const country = headersList.get('x-vercel-ip-country') || headersList.get('cf-ipcountry') || null;
        const city = headersList.get('x-vercel-ip-city') || null;

        const deviceType = /mobile/i.test(userAgent) ? 'mobile' : /tablet|ipad/i.test(userAgent) ? 'tablet' : 'desktop';

        let browser = 'other';
        if (/edg/i.test(userAgent)) browser = 'edge';
        else if (/chrome/i.test(userAgent)) browser = 'chrome';
        else if (/firefox/i.test(userAgent)) browser = 'firefox';
        else if (/safari/i.test(userAgent)) browser = 'safari';

        let os = 'other';
        if (/windows/i.test(userAgent)) os = 'windows';
        else if (/mac os|macintosh/i.test(userAgent)) os = 'macos';
        else if (/android/i.test(userAgent)) os = 'android';
        else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'ios';
        else if (/linux/i.test(userAgent)) os = 'linux';

        const utmRaw = cookieStore.get('ci_utm')?.value;
        let utm = { source: null as string | null, medium: null as string | null, campaign: null as string | null };
        if (utmRaw) { try { utm = JSON.parse(utmRaw); } catch {} }

        await prisma.sessionDetail.upsert({
            where: { sessionId },
            create: {
                sessionId, ip, userAgent, deviceType, browser, os,
                screenWidth: data.screenWidth || null, screenHeight: data.screenHeight || null,
                language: data.language || null, country, city,
                referrer: data.referrer || null, landingPage: data.landingPage || null,
                utmSource: utm.source, utmMedium: utm.medium, utmCampaign: utm.campaign,
            },
            update: { lastActivity: new Date() },
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to enrich session:', error);
        return { success: false };
    }
}

export async function updateSessionActivity(data: { pageCount?: number; totalDuration?: number; isBounce?: boolean }) {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('ci_session')?.value || 'unknown';

        const updateData: Record<string, unknown> = { lastActivity: new Date() };
        if (data.pageCount !== undefined) updateData.pageCount = data.pageCount;
        if (data.totalDuration !== undefined) updateData.totalDuration = data.totalDuration;
        if (data.isBounce !== undefined) updateData.isBounce = data.isBounce;

        await prisma.sessionDetail.updateMany({ where: { sessionId }, data: updateData });
        return { success: true };
    } catch { return { success: false }; }
}
