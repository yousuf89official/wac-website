import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateApiKey, hasScope } from '@/lib/api-keys';

// GET /api/v1/metrics?brandId=X&from=2026-01-01&to=2026-03-23 — Public API
export async function GET(request: Request) {
    const { error, apiKey } = await authenticateApiKey(request);
    if (error) return error;

    if (!hasScope(apiKey, 'read:metrics')) {
        return NextResponse.json({ error: 'Insufficient scope. Required: read:metrics' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brandId');
        const campaignId = searchParams.get('campaignId');
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
        const offset = parseInt(searchParams.get('offset') || '0');

        if (!brandId) {
            return NextResponse.json({ error: 'brandId is required' }, { status: 400 });
        }

        const where: any = { brandId };
        if (campaignId) where.campaignId = campaignId;
        if (from || to) {
            where.date = {};
            if (from) where.date.gte = new Date(from);
            if (to) where.date.lte = new Date(to);
        }

        const [metrics, total] = await Promise.all([
            prisma.metric.findMany({
                where,
                select: {
                    id: true, date: true, impressions: true, clicks: true,
                    spend: true, reach: true, engagement: true, currency: true,
                    region: true, country: true, campaignId: true,
                    subCampaignId: true, channelId: true,
                },
                orderBy: { date: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.metric.count({ where }),
        ]);

        // Compute aggregates
        const agg = await prisma.metric.aggregate({
            where,
            _sum: { impressions: true, clicks: true, spend: true, reach: true, engagement: true },
        });

        return NextResponse.json({
            data: metrics,
            aggregates: {
                totalImpressions: agg._sum.impressions || 0,
                totalClicks: agg._sum.clicks || 0,
                totalSpend: agg._sum.spend || 0,
                totalReach: agg._sum.reach || 0,
                totalEngagement: agg._sum.engagement || 0,
            },
            meta: { total, limit, offset, hasMore: offset + limit < total },
        });
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
