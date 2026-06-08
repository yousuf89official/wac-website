/**
 * Campaign Performance Scoring Engine
 *
 * Generates a 0-100 performance score for campaigns based on:
 * - Efficiency (CTR, CPC vs industry benchmarks)
 * - Growth trajectory (week-over-week trends)
 * - Spend efficiency (ROAS / cost per engagement)
 * - Audience engagement quality
 *
 * Scores are computed from real Metric data — never hardcoded.
 */

import { prisma } from '@/lib/prisma';

export interface CampaignScore {
    campaignId: string;
    campaignName: string;
    brandId: string;
    overallScore: number;       // 0-100
    efficiencyScore: number;    // 0-100
    growthScore: number;        // 0-100
    engagementScore: number;    // 0-100
    spendScore: number;         // 0-100
    trend: 'improving' | 'stable' | 'declining';
    insights: string[];
    metrics: {
        totalImpressions: number;
        totalClicks: number;
        totalSpend: number;
        totalReach: number;
        totalEngagement: number;
        ctr: number;
        cpc: number;
        cpm: number;
        engagementRate: number;
    };
    periodDays: number;
}

// Industry benchmark averages (will be stored in AppConfig later)
const BENCHMARKS = {
    ctr: 2.0,           // 2% average CTR
    cpc: 1.50,          // $1.50 average CPC
    cpm: 8.00,          // $8 CPM
    engagementRate: 3.5, // 3.5% engagement rate
};

/**
 * Score a single campaign based on its metric data.
 */
export async function scoreCampaign(campaignId: string, days: number = 30): Promise<CampaignScore> {
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { id: true, name: true, brandId: true },
    });

    if (!campaign) throw new Error('Campaign not found');

    const metrics = await prisma.metric.findMany({
        where: { campaignId, date: { gte: dateFrom } },
        orderBy: { date: 'asc' },
    });

    if (metrics.length === 0) {
        return {
            campaignId, campaignName: campaign.name, brandId: campaign.brandId,
            overallScore: 0, efficiencyScore: 0, growthScore: 0, engagementScore: 0, spendScore: 0,
            trend: 'stable', insights: ['No metric data available for this period'],
            metrics: { totalImpressions: 0, totalClicks: 0, totalSpend: 0, totalReach: 0, totalEngagement: 0, ctr: 0, cpc: 0, cpm: 0, engagementRate: 0 },
            periodDays: days,
        };
    }

    // Aggregate totals
    const totals = metrics.reduce((acc: any, m: any) => ({
        impressions: acc.impressions + m.impressions,
        clicks: acc.clicks + m.clicks,
        spend: acc.spend + m.spend,
        reach: acc.reach + m.reach,
        engagement: acc.engagement + m.engagement,
    }), { impressions: 0, clicks: 0, spend: 0, reach: 0, engagement: 0 });

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    const cpm = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;
    const engagementRate = totals.reach > 0 ? (totals.engagement / totals.reach) * 100 : 0;

    // --- EFFICIENCY SCORE (CTR + CPC vs benchmarks) ---
    const ctrRatio = Math.min(ctr / BENCHMARKS.ctr, 2); // Cap at 2x benchmark
    const cpcRatio = cpc > 0 ? Math.min(BENCHMARKS.cpc / cpc, 2) : 1; // Lower CPC = better
    const efficiencyScore = Math.round(((ctrRatio + cpcRatio) / 2) * 50);

    // --- GROWTH SCORE (week-over-week trend) ---
    const midpoint = Math.floor(metrics.length / 2);
    const firstHalf = metrics.slice(0, midpoint);
    const secondHalf = metrics.slice(midpoint);

    const firstImpressions = firstHalf.reduce((s: number, m: any) => s + m.impressions, 0);
    const secondImpressions = secondHalf.reduce((s: number, m: any) => s + m.impressions, 0);
    const firstEngagement = firstHalf.reduce((s: number, m: any) => s + m.engagement, 0);
    const secondEngagement = secondHalf.reduce((s: number, m: any) => s + m.engagement, 0);

    const impressionGrowth = firstImpressions > 0 ? ((secondImpressions - firstImpressions) / firstImpressions) : 0;
    const engagementGrowth = firstEngagement > 0 ? ((secondEngagement - firstEngagement) / firstEngagement) : 0;
    const avgGrowth = (impressionGrowth + engagementGrowth) / 2;

    let growthScore: number;
    let trend: 'improving' | 'stable' | 'declining';
    if (avgGrowth > 0.1) { growthScore = Math.min(100, 60 + avgGrowth * 100); trend = 'improving'; }
    else if (avgGrowth > -0.1) { growthScore = 50; trend = 'stable'; }
    else { growthScore = Math.max(0, 40 + avgGrowth * 100); trend = 'declining'; }
    growthScore = Math.round(growthScore);

    // --- ENGAGEMENT SCORE ---
    const engRatio = Math.min(engagementRate / BENCHMARKS.engagementRate, 2);
    const engagementScore = Math.round(engRatio * 50);

    // --- SPEND SCORE (efficiency of spend) ---
    const cpmRatio = cpm > 0 ? Math.min(BENCHMARKS.cpm / cpm, 2) : 1;
    const spendScore = Math.round(cpmRatio * 50);

    // --- OVERALL SCORE (weighted) ---
    const overallScore = Math.round(
        efficiencyScore * 0.30 +
        growthScore * 0.25 +
        engagementScore * 0.25 +
        spendScore * 0.20
    );

    // --- INSIGHTS ---
    const insights: string[] = [];
    if (ctr > BENCHMARKS.ctr * 1.5) insights.push(`CTR of ${ctr.toFixed(2)}% is ${((ctr / BENCHMARKS.ctr - 1) * 100).toFixed(0)}% above industry average`);
    else if (ctr < BENCHMARKS.ctr * 0.5) insights.push(`CTR of ${ctr.toFixed(2)}% is below industry average — consider refreshing creatives`);

    if (cpc > 0 && cpc < BENCHMARKS.cpc * 0.7) insights.push(`CPC of $${cpc.toFixed(2)} is highly efficient — ${((1 - cpc / BENCHMARKS.cpc) * 100).toFixed(0)}% below average`);
    else if (cpc > BENCHMARKS.cpc * 1.5) insights.push(`CPC of $${cpc.toFixed(2)} is above average — consider narrowing targeting or improving ad relevance`);

    if (trend === 'improving') insights.push(`Campaign is trending upward with ${(avgGrowth * 100).toFixed(1)}% growth`);
    else if (trend === 'declining') insights.push(`Campaign performance is declining — review audience fatigue and creative rotation`);

    if (engagementRate > BENCHMARKS.engagementRate * 1.5) insights.push(`Strong engagement rate of ${engagementRate.toFixed(2)}% — audience is highly responsive`);
    else if (engagementRate < BENCHMARKS.engagementRate * 0.3 && totals.reach > 0) insights.push(`Low engagement rate — content may not be resonating with the target audience`);

    if (insights.length === 0) insights.push('Campaign is performing within normal parameters');

    return {
        campaignId, campaignName: campaign.name, brandId: campaign.brandId,
        overallScore, efficiencyScore, growthScore, engagementScore, spendScore,
        trend, insights,
        metrics: {
            totalImpressions: totals.impressions, totalClicks: totals.clicks,
            totalSpend: totals.spend, totalReach: totals.reach, totalEngagement: totals.engagement,
            ctr, cpc, cpm, engagementRate,
        },
        periodDays: days,
    };
}

/**
 * Score all campaigns for a brand.
 */
export async function scoreBrand(brandId: string, days: number = 30): Promise<CampaignScore[]> {
    const campaigns = await prisma.campaign.findMany({
        where: { brandId, status: 'Active' },
        select: { id: true },
    });

    const scores: CampaignScore[] = [];
    for (const c of campaigns) {
        scores.push(await scoreCampaign(c.id, days));
    }

    return scores.sort((a, b) => b.overallScore - a.overallScore);
}
