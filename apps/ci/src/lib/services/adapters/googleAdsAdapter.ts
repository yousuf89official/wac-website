/**
 * Google Ads Adapter — Pulls campaign metrics from Google Ads API v18.
 *
 * Requires: GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_DEVELOPER_TOKEN
 * Integration must have: accessToken, refreshToken, customerId
 */

import { google } from 'googleapis';
import { decrypt, isEncrypted } from '@/lib/encryption';
import type { PlatformAdapter, NormalizedMetric } from '../syncEngine';
import { registerAdapter } from '../syncEngine';

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID?.trim() || '';
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET?.trim() || '';
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim() || '';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);

function decryptToken(token: string): string {
    return isEncrypted(token) ? decrypt(token) : token;
}

async function getAccessToken(refreshToken: string): Promise<string> {
    oauth2Client.setCredentials({ refresh_token: decryptToken(refreshToken) });
    const { token } = await oauth2Client.getAccessToken();
    if (!token) throw new Error('Failed to get Google Ads access token');
    return token;
}

const googleAdsAdapter: PlatformAdapter = {
    provider: 'google_ads',

    async refreshTokenIfNeeded(integration: any) {
        if (!integration.refreshToken) throw new Error('No refresh token');
        const accessToken = await getAccessToken(integration.refreshToken);
        return { accessToken };
    },

    async fetchCampaignMetrics(integration: any, dateFrom: Date, dateTo: Date): Promise<NormalizedMetric[]> {
        if (!integration.customerId || !integration.refreshToken) {
            throw new Error('Google Ads integration missing customerId or refreshToken');
        }

        const accessToken = await getAccessToken(integration.refreshToken);
        const customerId = integration.customerId.replace(/-/g, '');

        const fromStr = dateFrom.toISOString().split('T')[0].replace(/-/g, '');
        const toStr = dateTo.toISOString().split('T')[0].replace(/-/g, '');

        // GAQL query for campaign-level metrics by date
        const query = `
            SELECT
                segments.date,
                campaign.id,
                campaign.name,
                campaign.status,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.conversions,
                metrics.interactions
            FROM campaign
            WHERE segments.date BETWEEN '${fromStr}' AND '${toStr}'
              AND campaign.status != 'REMOVED'
            ORDER BY segments.date DESC
        `;

        const url = `https://googleads.googleapis.com/v18/customers/${customerId}/googleAds:searchStream`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'developer-token': DEVELOPER_TOKEN,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Google Ads API error (${response.status}): ${text.substring(0, 500)}`);
        }

        const data = await response.json();
        const metrics: NormalizedMetric[] = [];

        // Google Ads searchStream returns an array of result batches
        for (const batch of (Array.isArray(data) ? data : [data])) {
            for (const result of (batch.results || [])) {
                const seg = result.segments || {};
                const camp = result.campaign || {};
                const m = result.metrics || {};

                const metric: any = {
                    date: new Date(seg.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')),
                    impressions: parseInt(m.impressions || '0'),
                    clicks: parseInt(m.clicks || '0'),
                    spend: parseInt(m.costMicros || '0') / 1_000_000,
                    reach: parseInt(m.impressions || '0'),
                    engagement: parseInt(m.interactions || '0'),
                    currency: integration.brand?.defaultCurrency || 'USD',
                    brandId: integration.brandId,
                    // External campaign info for mapping via CampaignIntegration
                    _externalCampaignId: camp.id?.replace('customers/', '').replace('/campaigns/', ':') || null,
                    _externalCampaignName: camp.name || null,
                    campaignId: undefined, // Will be mapped by syncEngine via CampaignIntegration
                };
                metrics.push(metric);
            }
        }

        return metrics;
    },
};

registerAdapter(googleAdsAdapter);
export default googleAdsAdapter;
