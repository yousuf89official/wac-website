/**
 * Meta Ads Adapter — Pulls campaign metrics from Meta Marketing API v21.0.
 *
 * Requires: META_APP_ID, META_APP_SECRET
 * Integration must have: accessToken (long-lived), customerId (ad account ID)
 */

import { decrypt, isEncrypted } from '@/lib/encryption';
import type { PlatformAdapter, NormalizedMetric } from '../syncEngine';
import { registerAdapter } from '../syncEngine';

const META_APP_ID = process.env.META_APP_ID?.trim() || '';
const META_APP_SECRET = process.env.META_APP_SECRET?.trim() || '';
const API_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

function decryptToken(token: string): string {
    return isEncrypted(token) ? decrypt(token) : token;
}

const metaAdsAdapter: PlatformAdapter = {
    provider: 'meta_ads',

    async refreshTokenIfNeeded(integration: any) {
        if (!integration.accessToken) throw new Error('No access token');
        const token = decryptToken(integration.accessToken);

        // Exchange for long-lived token if short-lived
        try {
            const res = await fetch(
                `${BASE_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${token}`
            );
            if (res.ok) {
                const data = await res.json();
                return { accessToken: data.access_token };
            }
        } catch {}

        return { accessToken: token };
    },

    async fetchCampaignMetrics(integration: any, dateFrom: Date, dateTo: Date): Promise<NormalizedMetric[]> {
        if (!integration.accessToken || !integration.customerId) {
            throw new Error('Meta Ads integration missing accessToken or ad account ID');
        }

        const token = decryptToken(integration.accessToken);
        const adAccountId = integration.customerId.startsWith('act_') ? integration.customerId : `act_${integration.customerId}`;

        const fromStr = dateFrom.toISOString().split('T')[0];
        const toStr = dateTo.toISOString().split('T')[0];

        // Fetch campaign-level insights
        const url = `${BASE_URL}/${adAccountId}/insights?` + new URLSearchParams({
            fields: 'campaign_id,campaign_name,date_start,impressions,clicks,spend,reach,actions',
            time_range: JSON.stringify({ since: fromStr, until: toStr }),
            time_increment: '1', // Daily breakdown
            level: 'campaign',
            limit: '500',
            access_token: token,
        });

        const response = await fetch(url);
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Meta API error (${response.status}): ${text.substring(0, 500)}`);
        }

        const data = await response.json();
        const metrics: NormalizedMetric[] = [];

        for (const row of (data.data || [])) {
            // Extract engagement from actions (post_engagement, link_clicks, etc.)
            const engagementActions = (row.actions || []).filter((a: any) =>
                ['post_engagement', 'page_engagement', 'link_click'].includes(a.action_type)
            );
            const engagement = engagementActions.reduce((sum: number, a: any) => sum + parseInt(a.value || '0'), 0);

            const metric: any = {
                date: new Date(row.date_start),
                impressions: parseInt(row.impressions || '0'),
                clicks: parseInt(row.clicks || '0'),
                spend: parseFloat(row.spend || '0'),
                reach: parseInt(row.reach || '0'),
                engagement,
                currency: integration.brand?.defaultCurrency || 'USD',
                brandId: integration.brandId,
                campaignId: undefined,
                _externalCampaignId: row.campaign_id || null,
                _externalCampaignName: row.campaign_name || null,
            };
            metrics.push(metric);
        }

        return metrics;
    },
};

registerAdapter(metaAdsAdapter);
export default metaAdsAdapter;
