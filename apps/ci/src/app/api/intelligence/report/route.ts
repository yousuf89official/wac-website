import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { generateBrandSummary } from '@/lib/intelligence';
import { scoreBrand } from '@/lib/intelligence';
import { detectAnomalies } from '@/lib/intelligence';
import { generateBenchmarks } from '@/lib/intelligence';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-log';

/**
 * GET /api/intelligence/report?brandId=X&days=30&format=json
 *
 * Generates a comprehensive intelligence report combining all modules.
 * Returns JSON (for UI rendering or PDF generation client-side).
 */
export async function GET(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brandId');
        const days = parseInt(searchParams.get('days') || '30');

        if (!brandId) {
            return NextResponse.json({ error: 'brandId required' }, { status: 400 });
        }

        const brand = await prisma.brand.findUnique({
            where: { id: brandId },
            select: { id: true, name: true, slug: true, defaultCurrency: true, logo: true },
        });

        if (!brand) {
            return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
        }

        // Run all intelligence modules in parallel
        const [summary, scores, anomalies, benchmarks] = await Promise.all([
            generateBrandSummary(brandId, days),
            scoreBrand(brandId, days),
            detectAnomalies(brandId, days),
            generateBenchmarks(brandId, days),
        ]);

        // Get campaign count and subscription info
        const campaignCount = await prisma.campaign.count({
            where: { brandId, status: 'Active' },
        });

        const report = {
            meta: {
                brandId: brand.id,
                brandName: brand.name,
                brandSlug: brand.slug,
                brandLogo: brand.logo,
                currency: brand.defaultCurrency,
                generatedAt: new Date().toISOString(),
                generatedBy: session!.user.name || session!.user.email,
                period: `Last ${days} days`,
                periodDays: days,
                activeCampaigns: campaignCount,
            },
            summary: {
                headline: summary.headline,
                executiveSummary: summary.executiveSummary,
                keyMetrics: summary.keyMetrics,
                recommendations: summary.recommendations,
            },
            campaigns: scores.map(s => ({
                id: s.campaignId,
                name: s.campaignName,
                overallScore: s.overallScore,
                scores: {
                    efficiency: s.efficiencyScore,
                    growth: s.growthScore,
                    engagement: s.engagementScore,
                    spend: s.spendScore,
                },
                trend: s.trend,
                insights: s.insights,
                metrics: s.metrics,
            })),
            topPerformers: summary.topPerformers,
            underperformers: summary.underperformers,
            anomalies: {
                total: anomalies.length,
                critical: anomalies.filter(a => a.severity === 'critical').length,
                warnings: anomalies.filter(a => a.severity === 'warning').length,
                items: anomalies.slice(0, 10).map(a => ({
                    severity: a.severity,
                    metric: a.metric,
                    message: a.message,
                    deviation: a.deviationPct,
                    campaign: a.campaignName,
                    date: a.detectedAt,
                })),
            },
            benchmarks: {
                overallRating: benchmarks.overallRating,
                comparisons: benchmarks.comparisons.map(c => ({
                    metric: c.label,
                    you: c.brandValue,
                    industry: c.industryAvg,
                    vsIndustry: c.vsIndustry,
                    vsPrevious: c.vsPrevious,
                    rating: c.rating,
                })),
            },
        };

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'User',
            userEmail: session!.user.email || '',
            action: 'export',
            target: 'Intelligence Report',
            detail: `Generated ${days}-day intelligence report for ${brand.name}`,
        });

        return NextResponse.json(report);
    } catch (err: any) {
        console.error('Report generation error:', err);
        return NextResponse.json({ error: err.message || 'Failed to generate report' }, { status: 500 });
    }
}
