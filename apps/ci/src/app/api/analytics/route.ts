import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brandId');
        const campaignId = searchParams.get('campaignId');

        const where: any = {};
        if (brandId) where.brandId = brandId;
        if (campaignId) where.campaignId = campaignId;

        const metrics = await prisma.metric.findMany({
            where,
            orderBy: { date: 'asc' },
        });

        const chartData = metrics.map((m: any) => ({
            date: m.date.toISOString().split('T')[0],
            value: m.engagement,
            impressions: m.impressions,
            spend: m.spend,
            clicks: m.clicks,
            reach: m.reach,
            engagement: m.engagement,
            campaignId: m.campaignId,
        }));

        // Compute demographics from actual metric data if available,
        // otherwise return empty array (no mock data)
        let demographics: { name: string; value: number }[] = [];

        // Try to load demographics from AppConfig (can be set by admin or integration sync)
        try {
            const demoConfig = await prisma.appConfig.findUnique({ where: { key: `demographics:${brandId || 'global'}` } });
            if (demoConfig) {
                demographics = JSON.parse(demoConfig.value);
            }
        } catch {}

        // Compute summary aggregates
        const totals = metrics.reduce(
            (acc: any, m: any) => ({
                impressions: acc.impressions + m.impressions,
                clicks: acc.clicks + m.clicks,
                spend: acc.spend + m.spend,
                reach: acc.reach + m.reach,
                engagement: acc.engagement + m.engagement,
            }),
            { impressions: 0, clicks: 0, spend: 0, reach: 0, engagement: 0 }
        );

        const ctr = totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : '0.00';
        const cpc = totals.clicks > 0 ? (totals.spend / totals.clicks).toFixed(2) : '0.00';
        const cpm = totals.impressions > 0 ? ((totals.spend / totals.impressions) * 1000).toFixed(2) : '0.00';

        return NextResponse.json({
            trend: chartData,
            demographics,
            summary: {
                totalImpressions: totals.impressions,
                totalClicks: totals.clicks,
                totalSpend: totals.spend,
                totalReach: totals.reach,
                totalEngagement: totals.engagement,
                ctr,
                cpc,
                cpm,
                dataPoints: metrics.length,
            },
        });
    } catch (err) {
        console.error('Analytics Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
