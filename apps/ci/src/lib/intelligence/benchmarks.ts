/**
 * Competitive Benchmark Tracking
 *
 * Compares brand/campaign performance against:
 * 1. Industry benchmarks (stored in AppConfig, admin-editable)
 * 2. Internal cross-brand averages (computed from all brands in the platform)
 * 3. Historical self-comparison (same brand, previous period)
 */

import { prisma } from '@/lib/prisma';

export interface BenchmarkComparison {
    metric: string;
    label: string;
    brandValue: number;
    industryAvg: number;
    platformAvg: number;
    previousPeriod: number;
    vsIndustry: number;    // % above/below
    vsPlatform: number;    // % above/below
    vsPrevious: number;    // % change from last period
    rating: 'excellent' | 'good' | 'average' | 'below' | 'poor';
}

export interface BenchmarkReport {
    brandId: string;
    brandName: string;
    period: string;
    comparisons: BenchmarkComparison[];
    overallRating: string;
    industryBenchmarkSource: string;
}

// Default industry benchmarks (overridable via AppConfig 'config:benchmarks')
const DEFAULT_BENCHMARKS: Record<string, number> = {
    ctr: 2.0,
    cpc: 1.50,
    cpm: 8.00,
    engagementRate: 3.5,
    costPerEngagement: 0.50,
    reachRate: 15.0,
};

async function getIndustryBenchmarks(): Promise<Record<string, number>> {
    try {
        const config = await prisma.appConfig.findUnique({ where: { key: 'config:benchmarks' } });
        if (config) return JSON.parse(config.value);
    } catch {}
    return DEFAULT_BENCHMARKS;
}

/**
 * Generate benchmark comparison for a brand.
 */
export async function generateBenchmarks(brandId: string, days: number = 30): Promise<BenchmarkReport> {
    const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { id: true, name: true } });
    if (!brand) throw new Error('Brand not found');

    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const previousFrom = new Date(dateFrom.getTime() - days * 24 * 60 * 60 * 1000);

    // Current period metrics for this brand
    const currentMetrics = await prisma.metric.aggregate({
        where: { brandId, date: { gte: dateFrom } },
        _sum: { impressions: true, clicks: true, spend: true, reach: true, engagement: true },
    });

    // Previous period metrics for this brand
    const prevMetrics = await prisma.metric.aggregate({
        where: { brandId, date: { gte: previousFrom, lt: dateFrom } },
        _sum: { impressions: true, clicks: true, spend: true, reach: true, engagement: true },
    });

    // Platform-wide averages (all brands)
    const platformMetrics = await prisma.metric.aggregate({
        where: { date: { gte: dateFrom } },
        _sum: { impressions: true, clicks: true, spend: true, reach: true, engagement: true },
    });

    const platformBrandCount = await prisma.metric.groupBy({
        by: ['brandId'],
        where: { date: { gte: dateFrom } },
    });
    const brandCount = Math.max(platformBrandCount.length, 1);

    const benchmarks = await getIndustryBenchmarks();

    // Compute derived metrics
    function computeDerived(sums: any) {
        const imp = sums._sum?.impressions || 0;
        const clicks = sums._sum?.clicks || 0;
        const spend = sums._sum?.spend || 0;
        const reach = sums._sum?.reach || 0;
        const eng = sums._sum?.engagement || 0;
        return {
            ctr: imp > 0 ? (clicks / imp) * 100 : 0,
            cpc: clicks > 0 ? spend / clicks : 0,
            cpm: imp > 0 ? (spend / imp) * 1000 : 0,
            engagementRate: reach > 0 ? (eng / reach) * 100 : 0,
            costPerEngagement: eng > 0 ? spend / eng : 0,
            impressions: imp,
            clicks,
            spend,
            reach,
            engagement: eng,
        };
    }

    const current = computeDerived(currentMetrics);
    const previous = computeDerived(prevMetrics);
    const platform = computeDerived(platformMetrics);

    // Normalize platform to per-brand average
    const platformAvg = {
        ctr: platform.ctr, // CTR is already a rate
        cpc: platform.cpc,
        cpm: platform.cpm,
        engagementRate: platform.engagementRate,
        costPerEngagement: platform.costPerEngagement,
    };

    function pctDiff(a: number, b: number): number {
        if (b === 0) return a > 0 ? 100 : 0;
        return ((a - b) / b) * 100;
    }

    function rate(brandVal: number, benchmark: number, higherIsBetter: boolean): BenchmarkComparison['rating'] {
        const ratio = higherIsBetter ? (brandVal / benchmark) : (benchmark / brandVal);
        if (ratio >= 1.5) return 'excellent';
        if (ratio >= 1.1) return 'good';
        if (ratio >= 0.8) return 'average';
        if (ratio >= 0.5) return 'below';
        return 'poor';
    }

    const comparisons: BenchmarkComparison[] = [
        {
            metric: 'ctr', label: 'Click-Through Rate (%)',
            brandValue: current.ctr, industryAvg: benchmarks.ctr, platformAvg: platformAvg.ctr, previousPeriod: previous.ctr,
            vsIndustry: pctDiff(current.ctr, benchmarks.ctr),
            vsPlatform: pctDiff(current.ctr, platformAvg.ctr),
            vsPrevious: pctDiff(current.ctr, previous.ctr),
            rating: rate(current.ctr, benchmarks.ctr, true),
        },
        {
            metric: 'cpc', label: 'Cost Per Click',
            brandValue: current.cpc, industryAvg: benchmarks.cpc, platformAvg: platformAvg.cpc, previousPeriod: previous.cpc,
            vsIndustry: pctDiff(benchmarks.cpc, current.cpc), // Inverted: lower is better
            vsPlatform: pctDiff(platformAvg.cpc, current.cpc),
            vsPrevious: pctDiff(previous.cpc, current.cpc),
            rating: rate(current.cpc, benchmarks.cpc, false),
        },
        {
            metric: 'cpm', label: 'Cost Per 1000 Impressions',
            brandValue: current.cpm, industryAvg: benchmarks.cpm, platformAvg: platformAvg.cpm, previousPeriod: previous.cpm,
            vsIndustry: pctDiff(benchmarks.cpm, current.cpm),
            vsPlatform: pctDiff(platformAvg.cpm, current.cpm),
            vsPrevious: pctDiff(previous.cpm, current.cpm),
            rating: rate(current.cpm, benchmarks.cpm, false),
        },
        {
            metric: 'engagementRate', label: 'Engagement Rate (%)',
            brandValue: current.engagementRate, industryAvg: benchmarks.engagementRate, platformAvg: platformAvg.engagementRate, previousPeriod: previous.engagementRate,
            vsIndustry: pctDiff(current.engagementRate, benchmarks.engagementRate),
            vsPlatform: pctDiff(current.engagementRate, platformAvg.engagementRate),
            vsPrevious: pctDiff(current.engagementRate, previous.engagementRate),
            rating: rate(current.engagementRate, benchmarks.engagementRate, true),
        },
    ];

    // Overall rating
    const ratings = comparisons.map(c => c.rating);
    const ratingScore = ratings.reduce((s, r) => s + ({ excellent: 4, good: 3, average: 2, below: 1, poor: 0 }[r] || 0), 0);
    const avgRating = ratingScore / ratings.length;
    const overallRating = avgRating >= 3.5 ? 'Excellent' : avgRating >= 2.5 ? 'Good' : avgRating >= 1.5 ? 'Average' : 'Needs Improvement';

    return {
        brandId: brand.id,
        brandName: brand.name,
        period: `Last ${days} days`,
        comparisons,
        overallRating,
        industryBenchmarkSource: 'Platform defaults (editable in Admin > Settings)',
    };
}
