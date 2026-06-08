import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateApiKey, hasScope } from '@/lib/api-keys';

// GET /api/v1/campaigns?brandId=X — Public API: list campaigns
export async function GET(request: Request) {
    const { error, apiKey } = await authenticateApiKey(request);
    if (error) return error;

    if (!hasScope(apiKey, 'read:campaigns')) {
        return NextResponse.json({ error: 'Insufficient scope. Required: read:campaigns' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brandId');
        const status = searchParams.get('status') || 'Active';
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
        const offset = parseInt(searchParams.get('offset') || '0');

        const where: any = { status };
        if (brandId) where.brandId = brandId;

        const [campaigns, total] = await Promise.all([
            prisma.campaign.findMany({
                where,
                select: {
                    id: true, name: true, slug: true, description: true,
                    startDate: true, endDate: true, budgetPlanned: true,
                    currency: true, status: true, brandId: true,
                    createdAt: true, updatedAt: true,
                    _count: { select: { subCampaigns: true, channels: true, metrics: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.campaign.count({ where }),
        ]);

        return NextResponse.json({
            data: campaigns,
            meta: { total, limit, offset, hasMore: offset + limit < total },
        });
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
