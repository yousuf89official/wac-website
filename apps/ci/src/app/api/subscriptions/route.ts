import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// GET /api/subscriptions — Get current user's subscription
export async function GET() {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const subscription = await prisma.subscription.findFirst({
            where: { userId: session!.user.id, status: { in: ['active', 'trialing'] } },
            include: {
                plan: {
                    include: { prices: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!subscription) {
            // Return free plan info if no subscription
            const freePlan = await prisma.plan.findUnique({ where: { slug: 'free' } });
            return NextResponse.json({
                plan: freePlan ? { ...freePlan, quotas: JSON.parse(freePlan.quotas) } : null,
                subscription: null,
            });
        }

        return NextResponse.json({
            plan: {
                ...subscription.plan,
                quotas: JSON.parse(subscription.plan.quotas),
            },
            subscription: {
                id: subscription.id,
                status: subscription.status,
                billingCycle: subscription.billingCycle,
                region: subscription.region,
                currency: subscription.currency,
                amountPaid: subscription.amountPaid,
                trialEndsAt: subscription.trialEndsAt,
                currentPeriodStart: subscription.currentPeriodStart,
                currentPeriodEnd: subscription.currentPeriodEnd,
                canceledAt: subscription.canceledAt,
                createdAt: subscription.createdAt,
            },
        });
    } catch (err) {
        console.error('Subscription error:', err);
        return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
    }
}

// POST /api/subscriptions — Create or upgrade subscription (manual / payment webhook)
export async function POST(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { planSlug, billingCycle, region, currency, paymentProvider, paymentId } = await request.json();

        const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        // Get price for region
        const price = await prisma.planPrice.findFirst({
            where: { planId: plan.id, region: region || 'global_us' },
        });

        const amount = billingCycle === 'yearly' ? (price?.yearly || 0) : (price?.monthly || 0);

        // Deactivate existing subscriptions
        await prisma.subscription.updateMany({
            where: { userId: session!.user.id, status: { in: ['active', 'trialing'] } },
            data: { status: 'canceled', canceledAt: new Date() },
        });

        const now = new Date();
        const periodEnd = new Date(now);
        if (billingCycle === 'yearly') {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        const subscription = await prisma.subscription.create({
            data: {
                userId: session!.user.id,
                planId: plan.id,
                status: 'active',
                billingCycle: billingCycle || 'monthly',
                region: region || 'global_us',
                currency: currency || price?.currency || 'USD',
                amountPaid: amount,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                paymentProvider: paymentProvider || null,
                paymentId: paymentId || null,
            },
            include: { plan: true },
        });

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'User',
            userEmail: session!.user.email || '',
            action: 'create',
            target: 'Subscription',
            detail: `Subscribed to ${plan.name} (${billingCycle || 'monthly'}, ${currency || 'USD'})`,
        });

        return NextResponse.json({
            subscription: {
                id: subscription.id,
                status: subscription.status,
                plan: { ...subscription.plan, quotas: JSON.parse(subscription.plan.quotas) },
            },
        });
    } catch (err) {
        console.error('Subscription create error:', err);
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }
}
