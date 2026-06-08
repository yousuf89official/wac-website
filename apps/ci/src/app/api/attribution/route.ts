import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// Platform-to-channel mapping (channel IDs grouped by platform)
const PLATFORM_CHANNEL_MAP: Record<string, string[]> = {
    google: ['plt_google'],
    meta: ['plt_meta'],
    tiktok: ['plt_tiktok'],
};

export async function GET(request: NextRequest) {
    const { error } = await requireAuth();
    if (error) return error;

    try {
        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brandId') || undefined;

        // Fetch channels with their platform IDs
        const channels = await prisma.channel.findMany({});
        const channelPlatformMap: Record<string, string> = {};
        for (const ch of channels) {
            channelPlatformMap[ch.id] = ch.platformId;
        }

        // Fetch all metrics, optionally filtered by brand
        const metrics = await prisma.metric.findMany({
            where: brandId ? { brandId } : undefined,
        });

        // Fetch brands for the brand selector
        const brands = await prisma.brand.findMany({
            select: { id: true, name: true },
        });

        // Aggregate metrics by platform
        type PlatformAgg = {
            spend: number;
            impressions: number;
            clicks: number;
            reach: number;
            engagement: number;
        };

        const platformData: Record<string, PlatformAgg> = {
            google: { spend: 0, impressions: 0, clicks: 0, reach: 0, engagement: 0 },
            meta: { spend: 0, impressions: 0, clicks: 0, reach: 0, engagement: 0 },
            tiktok: { spend: 0, impressions: 0, clicks: 0, reach: 0, engagement: 0 },
        };

        let unassigned = 0;

        for (const m of metrics) {
            const platformId = m.channelId ? channelPlatformMap[m.channelId] : null;

            let platform: string | null = null;
            if (platformId) {
                for (const [key, ids] of Object.entries(PLATFORM_CHANNEL_MAP)) {
                    if (ids.includes(platformId)) {
                        platform = key;
                        break;
                    }
                }
            }

            if (platform && platformData[platform]) {
                platformData[platform].spend += Number(m.spend) || 0;
                platformData[platform].impressions += Number(m.impressions) || 0;
                platformData[platform].clicks += Number(m.clicks) || 0;
                platformData[platform].reach += Number(m.reach) || 0;
                platformData[platform].engagement += Number(m.engagement) || 0;
            } else {
                unassigned++;
            }
        }

        return NextResponse.json({
            platforms: platformData,
            brands,
            unassignedMetrics: unassigned,
            totalMetrics: metrics.length,
        });
    } catch (err: any) {
        console.error('Attribution API error:', err?.message || err);

        if (err?.code === 'P1001') {
            return NextResponse.json({
                platforms: {
                    google: { spend: 0, impressions: 0, clicks: 0, reach: 0, engagement: 0 },
                    meta: { spend: 0, impressions: 0, clicks: 0, reach: 0, engagement: 0 },
                    tiktok: { spend: 0, impressions: 0, clicks: 0, reach: 0, engagement: 0 },
                },
                brands: [],
                unassignedMetrics: 0,
                totalMetrics: 0,
            });
        }

        return NextResponse.json({ error: 'Failed to load attribution data' }, { status: 500 });
    }
}
