import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-log';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
    // Auth: cron secret or admin session
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
        // Cron auth OK
    } else {
        const { requireAdmin } = await import('@/lib/api-auth');
        const { error } = await requireAdmin();
        if (error) return error;
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 86_400_000);

    try {
        const alerts = await prisma.campaignAlert.findMany({
            where: { isActive: true },
            include: { campaign: { select: { id: true, name: true, brandId: true } } },
        });

        let evaluated = 0;
        let triggered = 0;

        for (const alert of alerts) {
            // Rate limit: skip if triggered within last 24 hours
            if (alert.lastTriggeredAt && new Date(alert.lastTriggeredAt) > oneDayAgo) continue;

            evaluated++;

            // Fetch last 7 days of metrics
            const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
            const metrics = await prisma.metric.findMany({
                where: { campaignId: alert.campaignId, date: { gte: weekAgo } },
            });

            // Aggregate
            let spend = 0, clicks = 0, impressions = 0;
            for (const m of metrics) {
                spend += Number(m.spend) || 0;
                clicks += Number(m.clicks) || 0;
                impressions += Number(m.impressions) || 0;
            }

            // Compute metric value
            let metricValue = 0;
            switch (alert.metric) {
                case 'spend': metricValue = spend; break;
                case 'cpa': metricValue = clicks > 0 ? spend / clicks : 0; break;
                case 'ctr': metricValue = impressions > 0 ? (clicks / impressions) * 100 : 0; break;
                case 'roas': metricValue = spend > 0 ? clicks / spend : 0; break;
            }

            // Evaluate
            let match = false;
            switch (alert.operator) {
                case 'gt': match = metricValue > alert.threshold; break;
                case 'lt': match = metricValue < alert.threshold; break;
                case 'gte': match = metricValue >= alert.threshold; break;
                case 'lte': match = metricValue <= alert.threshold; break;
            }

            if (match) {
                triggered++;
                await prisma.campaignAlert.update({
                    where: { id: alert.id },
                    data: { lastTriggeredAt: now },
                });

                await sendEmail({
                    to: [alert.createdBy], // In production, resolve userId to email
                    subject: `Alert: ${alert.type} on "${alert.campaign.name}"`,
                    html: `<p>Campaign <strong>${alert.campaign.name}</strong> triggered a <strong>${alert.type}</strong> alert.</p>
                           <p>${alert.metric} is ${metricValue.toFixed(2)}, which is ${alert.operator} ${alert.threshold}.</p>`,
                });

                await logActivity({
                    userName: 'System', userEmail: 'alerts@system',
                    action: 'alert_triggered', target: 'CampaignAlert',
                    detail: `Alert "${alert.type}" triggered for "${alert.campaign.name}": ${alert.metric}=${metricValue.toFixed(2)} ${alert.operator} ${alert.threshold}`,
                    severity: 'warning',
                });
            }
        }

        return NextResponse.json({ evaluated, triggered, total: alerts.length });
    } catch (err: any) {
        console.error('Alert evaluation error:', err);
        return NextResponse.json({ error: 'Alert evaluation failed', details: err.message }, { status: 500 });
    }
}
