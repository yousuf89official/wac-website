import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { sessionId, currentPath } = await req.json();

        // 1. Check Subscription
        const subscribed = await prisma.visitorEvent.findFirst({
            where: { sessionId, type: 'popup_subscribe' }
        });
        if (subscribed) return NextResponse.json({ show: false });

        // 2. Check Recent Dismissal (Snooze Logic)
        const lastDismissal = await prisma.visitorEvent.findFirst({
            where: { sessionId, type: 'popup_dismiss' },
            orderBy: { createdAt: 'desc' }
        });

        if (lastDismissal) {
            const timeSinceDismissal = Date.now() - new Date(lastDismissal.createdAt).getTime();
            const twoMinutes = 2 * 60 * 1000;
            if (timeSinceDismissal < twoMinutes) {
                return NextResponse.json({ show: false, reason: 'snoozed' });
            }
        }

        // 3. Determine Contextual Content
        let title = "Unlock Growth Insights";
        let message = "Join 10,000+ marketers getting weekly tips on scaling their brand.";

        if (currentPath && currentPath.includes('blog')) {
            title = "Stay Ahead of the Curve";
            message = "Get our latest marketing deep dives delivered straight to your inbox.";
        } else if (currentPath && currentPath.includes('services')) {
            title = "Need a Growth Partner?";
            message = "Sign up for our case study showcase to see how we help brands scale.";
        } else if (currentPath && (currentPath.includes('work') || currentPath.includes('case-studies'))) {
            title = "See How We Do It";
            message = "Get a behind-the-scenes look at our most successful campaigns.";
        }

        return NextResponse.json({
            show: true,
            config: {
                title,
                message,
                trigger: {
                    type: 'smart',
                    scrollInfo: 50,
                    timeInfo: 15 // reduced for testing/active engagement
                }
            }
        });
    } catch (error) {
        console.error('Popup Config Error:', error);
        return NextResponse.json({ error: 'Config failed' }, { status: 500 });
    }
}
