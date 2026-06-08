/**
 * AI Campaign Summary Generator
 *
 * Generates natural-language performance summaries from real metric data.
 * No AI API calls required — uses rule-based NLG (Natural Language Generation)
 * for instant, deterministic summaries. Can be upgraded to Claude API later.
 */

import { prisma } from '@/lib/prisma';
import { scoreBrand, type CampaignScore } from './scoring';
import { detectAnomalies, type Anomaly } from './anomalies';

export interface BrandSummary {
    brandId: string;
    brandName: string;
    generatedAt: Date;
    period: string;
    headline: string;
    executiveSummary: string;
    keyMetrics: {
        totalSpend: number;
        totalImpressions: number;
        totalClicks: number;
        totalEngagement: number;
        avgCTR: number;
        avgCPC: number;
        activeCampaigns: number;
    };
    topPerformers: { name: string; score: number; insight: string }[];
    underperformers: { name: string; score: number; recommendation: string }[];
    anomalies: { message: string; severity: string }[];
    recommendations: string[];
}

/**
 * Generate a comprehensive brand performance summary.
 */
export async function generateBrandSummary(brandId: string, days: number = 30): Promise<BrandSummary> {
    const brand = await prisma.brand.findUnique({
        where: { id: brandId },
        select: { id: true, name: true, defaultCurrency: true },
    });

    if (!brand) throw new Error('Brand not found');

    // Run scoring and anomaly detection in parallel
    const [scores, anomalies] = await Promise.all([
        scoreBrand(brandId, days),
        detectAnomalies(brandId, days),
    ]);

    // Aggregate metrics across all campaigns
    const keyMetrics = scores.reduce(
        (acc, s) => ({
            totalSpend: acc.totalSpend + s.metrics.totalSpend,
            totalImpressions: acc.totalImpressions + s.metrics.totalImpressions,
            totalClicks: acc.totalClicks + s.metrics.totalClicks,
            totalEngagement: acc.totalEngagement + s.metrics.totalEngagement,
        }),
        { totalSpend: 0, totalImpressions: 0, totalClicks: 0, totalEngagement: 0 }
    );

    const avgCTR = keyMetrics.totalImpressions > 0
        ? (keyMetrics.totalClicks / keyMetrics.totalImpressions) * 100 : 0;
    const avgCPC = keyMetrics.totalClicks > 0
        ? keyMetrics.totalSpend / keyMetrics.totalClicks : 0;

    // Classify performers
    const topPerformers = scores
        .filter(s => s.overallScore >= 60)
        .slice(0, 3)
        .map(s => ({
            name: s.campaignName,
            score: s.overallScore,
            insight: s.insights[0] || 'Performing well',
        }));

    const underperformers = scores
        .filter(s => s.overallScore > 0 && s.overallScore < 40)
        .slice(0, 3)
        .map(s => ({
            name: s.campaignName,
            score: s.overallScore,
            recommendation: generateRecommendation(s),
        }));

    // Generate headline
    const avgScore = scores.length > 0
        ? Math.round(scores.reduce((s: number, c: any) => s + c.overallScore, 0) / scores.length) : 0;

    const headline = generateHeadline(avgScore, scores.length, anomalies);

    // Generate executive summary
    const executiveSummary = generateExecutiveSummary(
        brand.name, days, scores, keyMetrics, avgCTR, avgCPC, anomalies
    );

    // Generate recommendations
    const recommendations = generateRecommendations(scores, anomalies, keyMetrics);

    return {
        brandId: brand.id,
        brandName: brand.name,
        generatedAt: new Date(),
        period: `Last ${days} days`,
        headline,
        executiveSummary,
        keyMetrics: {
            ...keyMetrics,
            avgCTR,
            avgCPC,
            activeCampaigns: scores.length,
        },
        topPerformers,
        underperformers,
        anomalies: anomalies.slice(0, 5).map(a => ({ message: a.message, severity: a.severity })),
        recommendations,
    };
}

function generateHeadline(avgScore: number, campaignCount: number, anomalies: Anomaly[]): string {
    const criticalCount = anomalies.filter(a => a.severity === 'critical').length;

    if (criticalCount > 0) return `Action Required: ${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} detected`;
    if (avgScore >= 75) return 'Strong performance across campaigns';
    if (avgScore >= 50) return 'Steady performance with optimization opportunities';
    if (avgScore >= 25) return 'Below-average performance — attention needed';
    if (campaignCount === 0) return 'No active campaigns with data';
    return 'Campaign performance needs immediate review';
}

function generateExecutiveSummary(
    brandName: string, days: number, scores: CampaignScore[],
    metrics: { totalSpend: number; totalImpressions: number; totalClicks: number; totalEngagement: number },
    avgCTR: number, avgCPC: number, anomalies: Anomaly[]
): string {
    if (scores.length === 0) {
        return `${brandName} has no active campaigns with metric data in the last ${days} days. Connect platform integrations and sync data to see performance insights.`;
    }

    const improving = scores.filter(s => s.trend === 'improving').length;
    const declining = scores.filter(s => s.trend === 'declining').length;
    const stable = scores.filter(s => s.trend === 'stable').length;

    const parts: string[] = [];

    parts.push(`${brandName} ran ${scores.length} active campaign${scores.length > 1 ? 's' : ''} over the last ${days} days, generating ${metrics.totalImpressions.toLocaleString()} impressions and ${metrics.totalClicks.toLocaleString()} clicks with a total spend of $${metrics.totalSpend.toLocaleString()}.`);

    if (avgCTR > 2) parts.push(`Average CTR of ${avgCTR.toFixed(2)}% is above industry benchmarks.`);
    else if (avgCTR > 0) parts.push(`Average CTR is ${avgCTR.toFixed(2)}%.`);

    if (improving > 0) parts.push(`${improving} campaign${improving > 1 ? 's are' : ' is'} trending upward.`);
    if (declining > 0) parts.push(`${declining} campaign${declining > 1 ? 's are' : ' is'} declining and may need attention.`);

    const criticals = anomalies.filter(a => a.severity === 'critical');
    if (criticals.length > 0) parts.push(`${criticals.length} critical anomal${criticals.length > 1 ? 'ies were' : 'y was'} detected requiring immediate review.`);

    return parts.join(' ');
}

function generateRecommendation(score: CampaignScore): string {
    if (score.efficiencyScore < 30) return 'Improve ad relevance and targeting to boost CTR';
    if (score.growthScore < 30) return 'Refresh creatives and expand audience to reverse decline';
    if (score.engagementScore < 30) return 'Test new content formats to increase engagement';
    if (score.spendScore < 30) return 'Optimize bidding strategy to reduce cost per result';
    return 'Review targeting and creative rotation';
}

function generateRecommendations(scores: CampaignScore[], anomalies: Anomaly[], metrics: any): string[] {
    const recs: string[] = [];

    // Spend anomalies
    const spendSpikes = anomalies.filter(a => a.metric === 'spend' && a.type === 'spike');
    if (spendSpikes.length > 0) {
        recs.push('Review spend pacing — unusual spending patterns detected. Set daily budget caps to prevent overspend.');
    }

    // Declining campaigns
    const declining = scores.filter(s => s.trend === 'declining');
    if (declining.length > 0) {
        recs.push(`${declining.length} campaign${declining.length > 1 ? 's are' : ' is'} declining. Consider refreshing creative assets and testing new audience segments.`);
    }

    // Low engagement
    const lowEngagement = scores.filter(s => s.engagementScore < 25 && s.metrics.totalReach > 0);
    if (lowEngagement.length > 0) {
        recs.push('Several campaigns have low engagement rates. Test interactive formats (polls, carousels, video) to boost interaction.');
    }

    // High CPC
    const highCPC = scores.filter(s => s.metrics.cpc > 3);
    if (highCPC.length > 0) {
        recs.push('Some campaigns have high CPC. Consider broadening targeting or improving Quality Score through better ad-landing page alignment.');
    }

    // Flatline
    const flatlines = anomalies.filter(a => a.type === 'flatline');
    if (flatlines.length > 0) {
        recs.push('Campaigns with flat metrics may be paused or capped. Check platform dashboards for delivery issues.');
    }

    // General
    if (metrics.totalSpend > 0 && metrics.totalClicks === 0) {
        recs.push('Spend is being recorded but no clicks — verify tracking is properly configured.');
    }

    if (scores.length > 0 && scores.every(s => s.overallScore >= 60)) {
        recs.push('All campaigns are performing well. Consider increasing budget allocation to top performers to maximize returns.');
    }

    if (recs.length === 0) {
        recs.push('Continue monitoring performance. Set up automated sync to keep data fresh.');
    }

    return recs.slice(0, 6);
}
