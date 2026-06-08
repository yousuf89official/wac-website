import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-log';

// GET — Health check
export async function GET() {
    return NextResponse.json({ status: 'ok', endpoint: 'payments/webhook' });
}

// POST /api/payments/webhook — Payment notification handler (Google Pay / generic)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderId, status: paymentStatus, paymentProvider } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'orderId required' }, { status: 400 });
        }

        const subscription = await prisma.subscription.findFirst({
            where: { paymentId: orderId },
            include: { plan: true, user: true },
        });

        if (!subscription) {
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        const now = new Date();
        const shouldActivate = paymentStatus === 'success' || paymentStatus === 'completed';

        const updateData: any = {
            status: shouldActivate ? 'active' : paymentStatus === 'failed' ? 'canceled' : 'pending',
        };

        if (shouldActivate) {
            const periodEnd = new Date(now);
            if (subscription.billingCycle === 'yearly') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
            else periodEnd.setMonth(periodEnd.getMonth() + 1);

            updateData.currentPeriodStart = now;
            updateData.currentPeriodEnd = periodEnd;

            await prisma.subscription.updateMany({
                where: { userId: subscription.userId, id: { not: subscription.id }, status: { in: ['active', 'trialing'] } },
                data: { status: 'canceled', canceledAt: now },
            });
        }

        if (updateData.status === 'canceled') updateData.canceledAt = now;

        await prisma.subscription.update({ where: { id: subscription.id }, data: updateData });

        await logActivity({
            userId: subscription.userId,
            userName: subscription.user?.name || 'User',
            userEmail: subscription.user?.email || 'system',
            action: shouldActivate ? 'create' : 'update',
            target: 'Payment',
            detail: `Payment ${paymentStatus}: ${subscription.plan.name} (${orderId})`,
            severity: paymentStatus === 'failed' ? 'warning' : 'info',
        });

        return NextResponse.json({ status: 'ok' });
    } catch (err: any) {
        console.error('Payment webhook error:', err);
        return NextResponse.json({ status: 'error', message: err.message }, { status: 200 });
    }
}
