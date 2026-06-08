/**
 * Sync Engine — Unified data pipeline for pulling metrics from ad platforms.
 *
 * Architecture:
 *   Integration (DB) → Platform Adapter → Normalize → Metric (DB)
 *
 * Each adapter implements fetchCampaignMetrics() which returns normalized data
 * that maps directly to the Metric table schema.
 */

import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-log';

export interface NormalizedMetric {
    date: Date;
    impressions: number;
    spend: number;
    clicks: number;
    reach: number;
    engagement: number;
    currency: string;
    region?: string;
    country?: string;
    brandId: string;
    campaignId?: string;
    subCampaignId?: string;
    channelId?: string;
}

export interface SyncResult {
    provider: string;
    brandId: string;
    metricsWritten: number;
    campaignsFound: number;
    errors: string[];
    durationMs: number;
}

export interface PlatformAdapter {
    provider: string;
    fetchCampaignMetrics(integration: any, dateFrom: Date, dateTo: Date): Promise<NormalizedMetric[]>;
    refreshTokenIfNeeded?(integration: any): Promise<{ accessToken: string; refreshToken?: string }>;
}

// Registry of platform adapters
const adapters = new Map<string, PlatformAdapter>();

export function registerAdapter(adapter: PlatformAdapter) {
    adapters.set(adapter.provider, adapter);
}

/**
 * Sync metrics for a single integration.
 */
export async function syncIntegration(integrationId: string, dateFrom?: Date, dateTo?: Date): Promise<SyncResult> {
    const start = Date.now();
    const errors: string[] = [];

    const integration = await prisma.integration.findUnique({
        where: { id: integrationId },
        include: { brand: true },
    });

    if (!integration) throw new Error('Integration not found');
    if (integration.status !== 'Active' && integration.status !== 'connected') {
        throw new Error(`Integration is ${integration.status}`);
    }

    const adapter = adapters.get(integration.provider);
    if (!adapter) throw new Error(`No adapter for provider: ${integration.provider}`);

    // Default: sync last 7 days
    const from = dateFrom || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const to = dateTo || new Date();

    let metrics: NormalizedMetric[] = [];

    try {
        // Refresh token if adapter supports it
        if (adapter.refreshTokenIfNeeded) {
            const newTokens = await adapter.refreshTokenIfNeeded(integration);
            if (newTokens.accessToken) {
                await prisma.integration.update({
                    where: { id: integration.id },
                    data: {
                        accessToken: newTokens.accessToken,
                        ...(newTokens.refreshToken && { refreshToken: newTokens.refreshToken }),
                    },
                });
            }
        }

        metrics = await adapter.fetchCampaignMetrics(integration, from, to);
    } catch (err: any) {
        errors.push(`Fetch error: ${err.message}`);
    }

    // Load campaign integration mappings to route metrics to correct campaigns
    const campaignLinks = await prisma.campaignIntegration.findMany({
        where: { integrationId: integration.id, isActive: true },
        select: { campaignId: true, externalCampaignId: true, externalName: true },
    });

    // Build lookup: externalCampaignId/externalName → our campaignId
    const campaignMap = new Map<string, string>();
    for (const link of campaignLinks) {
        if (link.externalCampaignId) campaignMap.set(link.externalCampaignId, link.campaignId);
        if (link.externalName) campaignMap.set(link.externalName.toLowerCase(), link.campaignId);
    }

    // Upsert metrics to database (deduplicate by date + brandId + campaignId + channelId)
    let written = 0;
    for (const m of metrics) {
        // Map external campaign to our campaign via the integration links
        if (!m.campaignId && campaignMap.size > 0) {
            // Adapters may set a temporary externalCampaignId on the metric
            const extId = (m as any)._externalCampaignId;
            const extName = (m as any)._externalCampaignName;
            if (extId && campaignMap.has(extId)) m.campaignId = campaignMap.get(extId);
            else if (extName && campaignMap.has(extName.toLowerCase())) m.campaignId = campaignMap.get(extName.toLowerCase());
            // If still no match, use the first linked campaign as default
            else if (campaignLinks.length === 1) m.campaignId = campaignLinks[0].campaignId;
        }
        try {
            // Check for existing metric on same date/brand/campaign/channel
            const existing = await prisma.metric.findFirst({
                where: {
                    date: m.date,
                    brandId: m.brandId,
                    campaignId: m.campaignId || null,
                    channelId: m.channelId || null,
                },
            });

            if (existing) {
                await prisma.metric.update({
                    where: { id: existing.id },
                    data: {
                        impressions: m.impressions,
                        spend: m.spend,
                        clicks: m.clicks,
                        reach: m.reach,
                        engagement: m.engagement,
                        currency: m.currency,
                        region: m.region,
                        country: m.country,
                    },
                });
            } else {
                await prisma.metric.create({ data: m });
            }
            written++;
        } catch (err: any) {
            errors.push(`Write error for ${m.date.toISOString()}: ${err.message}`);
        }
    }

    const result: SyncResult = {
        provider: integration.provider,
        brandId: integration.brandId,
        metricsWritten: written,
        campaignsFound: new Set(metrics.map(m => m.campaignId).filter(Boolean)).size,
        errors,
        durationMs: Date.now() - start,
    };

    await logActivity({
        userName: 'System',
        userEmail: 'sync@system',
        action: 'sync',
        target: `Integration:${integration.provider}`,
        detail: `Synced ${written} metrics for ${integration.brand?.name || integration.brandId} (${result.campaignsFound} campaigns, ${errors.length} errors, ${result.durationMs}ms)`,
        severity: errors.length > 0 ? 'warning' : 'info',
    });

    return result;
}

/**
 * Sync all active integrations for a brand.
 */
export async function syncBrand(brandId: string, dateFrom?: Date, dateTo?: Date): Promise<SyncResult[]> {
    const integrations = await prisma.integration.findMany({
        where: { brandId, status: { in: ['Active', 'connected'] } },
    });

    const results: SyncResult[] = [];
    for (const integration of integrations) {
        try {
            const result = await syncIntegration(integration.id, dateFrom, dateTo);
            results.push(result);
        } catch (err: any) {
            results.push({
                provider: integration.provider,
                brandId,
                metricsWritten: 0,
                campaignsFound: 0,
                errors: [err.message],
                durationMs: 0,
            });
        }
    }
    return results;
}

/**
 * Sync all active integrations across all brands.
 */
export async function syncAll(dateFrom?: Date, dateTo?: Date): Promise<SyncResult[]> {
    const integrations = await prisma.integration.findMany({
        where: { status: { in: ['Active', 'connected'] } },
    });

    const results: SyncResult[] = [];
    for (const integration of integrations) {
        try {
            const result = await syncIntegration(integration.id, dateFrom, dateTo);
            results.push(result);
        } catch (err: any) {
            results.push({
                provider: integration.provider,
                brandId: integration.brandId,
                metricsWritten: 0,
                campaignsFound: 0,
                errors: [err.message],
                durationMs: 0,
            });
        }
    }
    return results;
}
