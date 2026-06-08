import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        // Find brand by slug OR normalized name (matching what we show in UI)
        // In UI we show brandName.replace(/\s+/g, '')
        const brand = await prisma.brand.findFirst({
            where: {
                OR: [
                    { slug: slug },
                    { name: { contains: slug } } // Loose match for pretty URL
                ]
            },
            include: {
                shareLinks: {
                    where: {
                        isActive: true,
                        OR: [
                            { expiresAt: null },
                            { expiresAt: { gt: new Date() } }
                        ]
                    }
                }
            }
        });

        // Robust verification: check if the matched brand's formatted name matches the slug
        // or if the actual slug matches perfectly
        const isMatch = brand && (
            brand.slug.toLowerCase() === slug.toLowerCase() ||
            brand.name.replace(/\s+/g, '').toLowerCase() === slug.toLowerCase()
        );

        if (!brand || !isMatch || brand.shareLinks.length === 0) {
            return NextResponse.json({
                error: 'Public access has not been generated for this dashboard.'
            }, { status: 403 });
        }

        // Fetch metrics and campaigns
        const metrics = await prisma.metric.findMany({
            where: { brandId: brand.id },
            orderBy: { date: 'asc' }
        });

        const campaigns = await prisma.campaign.findMany({
            where: { brandId: brand.id },
            include: { metrics: true }
        });

        // Construct response
        return NextResponse.json({
            brand: {
                id: brand.id,
                name: brand.name,
                slug: brand.slug,
                logo_url: brand.logo,
                website: brand.website,
                categories: [brand.industryId].filter(Boolean),
                brand_color: brand.brandColor,
            },
            campaigns: campaigns,
            metrics: metrics.map((m: any) => ({
                campaign_id: m.campaignId,
                date: m.date.toISOString().split('T')[0],
                impressions: m.impressions,
                clicks: m.clicks,
                reach: m.reach,
                engagements: m.engagement,
                spend: m.spend
            })),
            creatives: [], // Placeholder
        });

    } catch (error) {
        console.error('Branded API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
