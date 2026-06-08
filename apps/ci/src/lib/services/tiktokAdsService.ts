import { prisma } from '../prisma';
import { encrypt, decrypt, isEncrypted } from '../encryption';

const APP_ID = process.env.TIKTOK_ADS_APP_ID?.trim() || '';
const APP_SECRET = process.env.TIKTOK_ADS_SECRET?.trim() || '';
const BASE_URL = 'https://business-api.tiktok.com';
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/integrations/tiktok-ads/callback`
    : 'http://localhost:3000/integrations/tiktok-ads/callback';

export const TiktokAdsService = {
    getAuthUrl: (brandId: string) => {
        const params = new URLSearchParams({
            app_id: APP_ID,
            state: JSON.stringify({ brandId }),
            redirect_uri: REDIRECT_URI,
        });
        return `${BASE_URL}/portal/auth?${params.toString()}`;
    },

    handleCallback: async (authCode: string, brandId: string) => {
        const res = await fetch(`${BASE_URL}/open_api/v1.3/oauth2/access_token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                app_id: APP_ID,
                secret: APP_SECRET,
                auth_code: authCode,
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`TikTok token exchange failed: ${err}`);
        }

        const result = await res.json();
        if (result.code !== 0) {
            throw new Error(`TikTok API error: ${result.message || JSON.stringify(result)}`);
        }

        const { access_token } = result.data;

        await prisma.integration.create({
            data: {
                brandId,
                provider: 'tiktok_ads',
                accessToken: encrypt(access_token),
                refreshToken: null,
                customerId: null,
                accountName: null,
                status: 'connected',
            },
        });

        return result.data;
    },

    getAdvertiserAccounts: async (accessToken: string) => {
        const token = isEncrypted(accessToken) ? decrypt(accessToken) : accessToken;
        const params = new URLSearchParams({
            app_id: APP_ID,
            secret: APP_SECRET,
            access_token: token,
        });
        const res = await fetch(`${BASE_URL}/open_api/v1.3/oauth2/advertiser/get/?${params.toString()}`, {
            headers: { 'Access-Token': token },
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`TikTok advertiser accounts fetch failed: ${err}`);
        }

        const result = await res.json();
        if (result.code !== 0) {
            throw new Error(`TikTok API error: ${result.message}`);
        }

        return result.data?.list || [];
    },
};
