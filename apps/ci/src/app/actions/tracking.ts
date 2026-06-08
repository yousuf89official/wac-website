'use server';

import { prisma } from '@/lib/prisma';
import { cookies, headers } from 'next/headers';

export async function trackPageView(data: { path: string; referrer?: string }) {
    try {
        const cookieStore = await cookies();
        const headersList = await headers();

        const sessionId = cookieStore.get('ci_session')?.value || 'unknown';

        const utmRaw = cookieStore.get('ci_utm')?.value;
        let utm = { source: null as string | null, medium: null as string | null, campaign: null as string | null, content: null as string | null, term: null as string | null };
        if (utmRaw) { try { utm = JSON.parse(utmRaw); } catch {} }

        const userAgent = headersList.get('user-agent') || '';
        const country = headersList.get('x-vercel-ip-country') || headersList.get('cf-ipcountry') || null;

        const deviceType = /mobile/i.test(userAgent) ? 'mobile' : /tablet|ipad/i.test(userAgent) ? 'tablet' : 'desktop';

        let browser = 'other';
        if (/edg/i.test(userAgent)) browser = 'edge';
        else if (/chrome/i.test(userAgent)) browser = 'chrome';
        else if (/firefox/i.test(userAgent)) browser = 'firefox';
        else if (/safari/i.test(userAgent)) browser = 'safari';

        await prisma.pageView.create({
            data: {
                path: data.path, referrer: data.referrer || null,
                utmSource: utm.source, utmMedium: utm.medium, utmCampaign: utm.campaign,
                utmContent: utm.content, utmTerm: utm.term,
                deviceType, browser, country, sessionId,
            },
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to track page view:', error);
        return { success: false };
    }
}

export async function trackEvent(data: { name: string; category?: string; path: string; metadata?: Record<string, unknown> }) {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('ci_session')?.value || 'unknown';

        await prisma.analyticsEvent.create({
            data: {
                name: data.name, category: data.category || null,
                path: data.path, sessionId,
                metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            },
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to track event:', error);
        return { success: false };
    }
}
