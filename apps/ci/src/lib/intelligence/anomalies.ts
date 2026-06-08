/**
 * Anomaly Detection Engine
 *
 * Detects unusual spikes or drops in campaign metrics using
 * statistical analysis (z-score based deviation detection).
 *
 * Checks: spend spikes, CTR drops, engagement drops, impression surges,
 * budget pacing issues, and sudden performance changes.
 */

import { prisma } from '@/lib/prisma';

export interface Anomaly {
    id: string;
    brandId: string;
    campaignId?: string;
    campaignName?: string;
    type: 'spike' | 'drop' | 'pacing' | 'flatline';
    severity: 'info' | 'warning' | 'critical';
    metric: string;          // impressions, clicks, spend, engagement, ctr, cpc
    currentValue: number;
    expectedValue: number;
    deviationPct: number;    // How far from expected (%)
    message: string;
    detectedAt: Date;
}

interface MetricRow {
    date: Date;
    impressions: number;
    clicks: number;
    spend: number;
    reach: number;
    engagement: number;
    campaignId: string | null;
}

function mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((s, v) => s + v, 0) / values.length;
}

function stdDev(values: number[]): number {
    if (values.length < 2) return 0;
    const avg = mean(values);
    const variance = values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / (values.length - 1);
    return Math.sqrt(variance);
}

function zScore(value: number, avg: number, sd: number): number {
    if (sd === 0) return 0;
    return (value - avg) / sd;
}

/**
 * Detect anomalies for a brand over the given period.
 */
export async function detectAnomalies(brandId: string, days: number = 30): Promise<Anomaly[]> {
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const metrics: MetricRow[] = await prisma.metric.findMany({
        where: { brandId, date: { gte: dateFrom } },
        orderBy: { date: 'asc' },
        select: { date: true, impressions: true, clicks: true, spend: true, reach: true, engagement: true, campaignId: true },
    });

    if (metrics.length < 7) return []; // Need at least a week of data

    const anomalies: Anomaly[] = [];
    let counter = 0;

    // Group by campaign
    const campaigns = new Map<string, MetricRow[]>();
    for (const m of metrics) {
        const key = m.campaignId || '_brand_total';
        if (!campaigns.has(key)) campaigns.set(key, []);
        campaigns.get(key)!.push(m);
    }

    // Get campaign names
    const campaignIds = Array.from(campaigns.keys()).filter(k => k !== '_brand_total');
    const campaignNames = new Map<string, string>();
    if (campaignIds.length > 0) {
        const camps = await prisma.campaign.findMany({
            where: { id: { in: campaignIds } },
            select: { id: true, name: true },
        });
        for (const c of camps) campaignNames.set(c.id, c.name);
    }

    for (const [campaignId, rows] of Array.from(campaigns.entries())) {
        if (rows.length < 5) continue;

        const isTotal = campaignId === '_brand_total';
        const cName = isTotal ? 'All Campaigns' : (campaignNames.get(campaignId) || campaignId);

        // Analyze each metric dimension
        const checks: { metric: string; values: number[]; label: string }[] = [
            { metric: 'impressions', values: rows.map(r => r.impressions), label: 'Impressions' },
            { metric: 'clicks', values: rows.map(r => r.clicks), label: 'Clicks' },
            { metric: 'spend', values: rows.map(r => r.spend), label: 'Spend' },
            { metric: 'engagement', values: rows.map(r => r.engagement), label: 'Engagement' },
        ];

        // Add derived metrics
        const ctrs = rows.map(r => r.impressions > 0 ? (r.clicks / r.impressions) * 100 : 0);
        checks.push({ metric: 'ctr', values: ctrs, label: 'CTR' });

        const cpcs = rows.map(r => r.clicks > 0 ? r.spend / r.clicks : 0);
        checks.push({ metric: 'cpc', values: cpcs, label: 'CPC' });

        for (const { metric, values, label } of checks) {
            const avg = mean(values);
            const sd = stdDev(values);
            if (avg === 0 && sd === 0) continue;

            // Check last 3 data points for anomalies
            const recentValues = values.slice(-3);
            for (let i = 0; i < recentValues.length; i++) {
                const val = recentValues[i];
                const z = zScore(val, avg, sd);
                const deviation = avg > 0 ? ((val - avg) / avg) * 100 : 0;

                // Z-score > 2 = significant deviation
                if (Math.abs(z) < 2) continue;

                const isSpike = z > 0;
                const absDev = Math.abs(deviation);

                let severity: 'info' | 'warning' | 'critical';
                if (Math.abs(z) > 3) severity = 'critical';
                else if (Math.abs(z) > 2.5) severity = 'warning';
                else severity = 'info';

                // Spend spikes are always higher severity
                if (metric === 'spend' && isSpike && severity === 'info') severity = 'warning';

                let message: string;
                if (metric === 'spend' && isSpike) {
                    message = `${cName}: Spend spiked ${absDev.toFixed(0)}% above average — check for budget pacing issues`;
                } else if (metric === 'ctr' && !isSpike) {
                    message = `${cName}: CTR dropped ${absDev.toFixed(0)}% below average — creative fatigue likely`;
                } else if (metric === 'engagement' && !isSpike) {
                    message = `${cName}: Engagement dropped ${absDev.toFixed(0)}% — audience may be fatigued`;
                } else if (metric === 'impressions' && isSpike) {
                    message = `${cName}: Impression surge of ${absDev.toFixed(0)}% — check if targeting changed`;
                } else if (metric === 'cpc' && isSpike) {
                    message = `${cName}: CPC increased ${absDev.toFixed(0)}% — competition may be increasing`;
                } else {
                    message = `${cName}: ${label} ${isSpike ? 'spiked' : 'dropped'} ${absDev.toFixed(0)}% from average`;
                }

                anomalies.push({
                    id: `anomaly_${++counter}`,
                    brandId,
                    campaignId: isTotal ? undefined : campaignId,
                    campaignName: cName,
                    type: isSpike ? 'spike' : 'drop',
                    severity,
                    metric,
                    currentValue: val,
                    expectedValue: avg,
                    deviationPct: deviation,
                    message,
                    detectedAt: rows[rows.length - 3 + i]?.date || new Date(),
                });
            }
        }

        // Flatline detection: if last 5 values are identical (within 1%), flag it
        if (rows.length >= 5) {
            const last5Impressions = rows.slice(-5).map(r => r.impressions);
            const l5Avg = mean(last5Impressions);
            const allSame = l5Avg > 0 && last5Impressions.every(v => Math.abs(v - l5Avg) / l5Avg < 0.01);
            if (allSame) {
                anomalies.push({
                    id: `anomaly_${++counter}`,
                    brandId,
                    campaignId: isTotal ? undefined : campaignId,
                    campaignName: cName,
                    type: 'flatline',
                    severity: 'warning',
                    metric: 'impressions',
                    currentValue: l5Avg,
                    expectedValue: l5Avg,
                    deviationPct: 0,
                    message: `${cName}: Impressions have been flat for 5 consecutive periods — campaign may be stuck or paused`,
                    detectedAt: new Date(),
                });
            }
        }
    }

    // Sort by severity (critical first) then by deviation
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return anomalies.sort((a, b) =>
        severityOrder[a.severity] - severityOrder[b.severity] || Math.abs(b.deviationPct) - Math.abs(a.deviationPct)
    );
}
