import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// GET /api/campaigns — List campaigns with sub-campaigns and metrics aggregates
export async function GET(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const statusFilter = searchParams.get('status');

    try {
        const where: any = statusFilter === 'Archive'
            ? { status: 'Archive' }
            : { status: { not: 'Archive' } };
        if (brandId) where.brandId = brandId;

        const campaigns = await prisma.campaign.findMany({
            where,
            include: {
                subCampaigns: {
                    where: { status: { not: 'Archive' } },
                    include: {
                        channels: { include: { channel: true } },
                        _count: { select: { metrics: true } },
                    },
                },
                channels: { include: { channel: true } },
                _count: { select: { metrics: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Aggregate spend from metrics for each campaign
        const campaignIds = campaigns.map((c: any) => c.id);
        const spendAggregates = campaignIds.length > 0 ? await prisma.metric.groupBy({
            by: ['campaignId'],
            where: { campaignId: { in: campaignIds } },
            _sum: { spend: true, impressions: true, clicks: true, engagement: true },
        }) : [];

        const spendMap = new Map<string, any>(spendAggregates.map((a: any) => [a.campaignId, a._sum]));

        const enriched = campaigns.map((c: any) => {
            const agg: any = spendMap.get(c.id) || {};
            return {
                ...c,
                spend: agg.spend || 0,
                totalImpressions: agg.impressions || 0,
                totalClicks: agg.clicks || 0,
                totalEngagement: agg.engagement || 0,
            };
        });

        return NextResponse.json(enriched);
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}

// POST /api/campaigns — Create a new campaign
export async function POST(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;

    try {
        const body = await request.json();
        const { name, brandId, description, startDate, endDate, budgetPlanned, status } = body;

        if (!name || !brandId) {
            return NextResponse.json({ error: 'Name and Brand ID are required' }, { status: 400 });
        }

        // Check for duplicate
        const existing = await prisma.campaign.findFirst({
            where: { brandId, name: { equals: name.trim() }, status: { not: 'Archive' } },
        });
        if (existing) {
            return NextResponse.json({
                error: 'Duplicate Campaign Detected',
                details: `A campaign named "${name.trim()}" already exists for this brand.`,
            }, { status: 409 });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

        const campaign = await prisma.campaign.create({
            data: {
                name: name.trim(),
                slug,
                brandId,
                description: description || null,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                budgetPlanned: parseFloat(budgetPlanned || '0'),
                status: status || 'Active',
            },
        });

        return NextResponse.json(campaign, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
