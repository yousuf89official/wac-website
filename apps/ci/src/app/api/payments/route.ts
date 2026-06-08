import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';
import { randomBytes } from 'crypto';

// POST /api/payments — Create a payment for a plan upgrade
export async function POST(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { planSlug, billingCycle, region, paymentProvider, paymentId } = await request.json();

        if (!planSlug || !billingCycle) {
            return NextResponse.json({ error: 'planSlug and billingCycle are required' }, { status: 400 });
        }

        if (!['monthly', 'yearly'].includes(billingCycle)) {
            return NextResponse.json({ error: 'billingCycle must be monthly or yearly' }, { status: 400 });
        }

        const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
        if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        if (plan.slug === 'free') return NextResponse.json({ error: 'Free plan does not require payment' }, { status: 400 });
        if (plan.slug === 'enterprise') return NextResponse.json({ error: 'Contact sales for Enterprise plan' }, { status: 400 });

        // Get regional price
        const price = await prisma.planPrice.findFirst({
            where: { planId: plan.id, region: region || 'global_us' },
        });

        if (!price) return NextResponse.json({ error: 'Pricing not available for this region' }, { status: 404 });

        const rawAmount = billingCycle === 'yearly' ? price.yearly * 12 : price.monthly;
        const orderId = paymentId || `CI-${Date.now()}-${randomBytes(4).toString('hex')}`;

        // Deactivate existing subscriptions
        await prisma.subscription.updateMany({
            where: { userId: session!.user.id, status: { in: ['active', 'trialing'] } },
            data: { status: 'canceled', canceledAt: new Date() },
        });

        const now = new Date();
        const periodEnd = new Date(now);
        if (billingCycle === 'yearly') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        else periodEnd.setMonth(periodEnd.getMonth() + 1);

        const subscription = await prisma.subscription.create({
            data: {
                userId: session!.user.id,
                planId: plan.id,
                status: 'active',
                billingCycle,
                region: region || 'global_us',
                currency: price.currency,
                amountPaid: rawAmount,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                paymentProvider: paymentProvider || 'google_pay',
                paymentId: orderId,
            },
            include: { plan: true },
        });

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'User',
            userEmail: session!.user.email || '',
            action: 'create',
            target: 'Subscription',
            detail: `Subscribed to ${plan.name} (${billingCycle}, ${price.currency})`,
        });

        return NextResponse.json({
            subscription: {
                id: subscription.id,
                status: subscription.status,
                plan: { ...subscription.plan, quotas: JSON.parse(subscription.plan.quotas) },
            },
        });
    } catch (err: any) {
        console.error('Payment error:', err);
        return NextResponse.json({ error: err.message || 'Failed to process payment' }, { status: 500 });
    }
}
