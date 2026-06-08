/**
 * TikTok Ads Adapter — Pulls campaign metrics from TikTok Marketing API v1.3.
 *
 * Requires: TIKTOK_APP_ID, TIKTOK_APP_SECRET
 * Integration must have: accessToken, customerId (advertiser_id)
 */

import { decrypt, isEncrypted } from '@/lib/encryption';
import type { PlatformAdapter, NormalizedMetric } from '../syncEngine';
import { registerAdapter } from '../syncEngine';

const BASE_URL = 'https://business-api.tiktok.com/open_api/v1.3';

function decryptToken(token: string): string {
    return isEncrypted(token) ? decrypt(token) : token;
}

const tiktokAdsAdapter: PlatformAdapter = {
    provider: 'tiktok_ads',

    async fetchCampaignMetrics(integration: any, dateFrom: Date, dateTo: Date): Promise<NormalizedMetric[]> {
        if (!integration.accessToken || !integration.customerId) {
            throw new Error('TikTok Ads integration missing accessToken or advertiser_id');
        }

        const token = decryptToken(integration.accessToken);
        const advertiserId = integration.customerId;

        const fromStr = dateFrom.toISOString().split('T')[0];
        const toStr = dateTo.toISOString().split('T')[0];

        // Fetch campaign-level reports
        const params = new URLSearchParams({
            advertiser_id: advertiserId,
            report_type: 'BASIC',
            data_level: 'AUCTION_CAMPAIGN',
            dimensions: JSON.stringify(['campaign_id', 'stat_time_day']),
            metrics: JSON.stringify([
                'campaign_name', 'impressions', 'clicks', 'spend', 'reach', 'engagement_rate',
                'likes', 'comments', 'shares', 'follows',
            ]),
            start_date: fromStr,
            end_date: toStr,
            page: '1',
            page_size: '200',
        });

        const response = await fetch(`${BASE_URL}/report/integrated/get/?${params}`, {
            headers: {
                'Access-Token': token,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`TikTok API error (${response.status}): ${text.substring(0, 500)}`);
        }

        const data = await response.json();

        if (data.code !== 0) {
            throw new Error(`TikTok API error: ${data.message}`);
        }

        const metrics: NormalizedMetric[] = [];

        for (const row of (data.data?.list || [])) {
            const dims = row.dimensions || {};
            const m = row.metrics || {};

            const engagement = parseInt(m.likes || '0') + parseInt(m.comments || '0') +
                               parseInt(m.shares || '0') + parseInt(m.follows || '0');

            const metric: any = {
                date: new Date(dims.stat_time_day),
                impressions: parseInt(m.impressions || '0'),
                clicks: parseInt(m.clicks || '0'),
                spend: parseFloat(m.spend || '0'),
                reach: parseInt(m.reach || '0'),
                engagement,
                currency: integration.brand?.defaultCurrency || 'USD',
                brandId: integration.brandId,
                campaignId: undefined,
                _externalCampaignId: dims.campaign_id || null,
                _externalCampaignName: m.campaign_name || null,
            };
            metrics.push(metric);
        }

        return metrics;
    },
};

registerAdapter(tiktokAdsAdapter);
export default tiktokAdsAdapter;
