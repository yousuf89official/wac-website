import { prisma } from '../prisma';
import { encrypt, decrypt, isEncrypted } from '../encryption';

const APP_ID = process.env.META_APP_ID?.trim() || '';
const APP_SECRET = process.env.META_APP_SECRET?.trim() || '';
const API_VERSION = 'v22.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/integrations/meta-ads/callback`
    : 'http://localhost:3000/integrations/meta-ads/callback';

export const MetaAdsService = {
    getAuthUrl: (brandId: string) => {
        const params = new URLSearchParams({
            client_id: APP_ID,
            redirect_uri: REDIRECT_URI,
            scope: 'ads_read,ads_management',
            response_type: 'code',
            state: JSON.stringify({ brandId }),
        });
        return `https://www.facebook.com/${API_VERSION}/dialog/oauth?${params.toString()}`;
    },

    handleCallback: async (code: string, brandId: string) => {
        // Step 1: Exchange code for short-lived token
        const tokenParams = new URLSearchParams({
            client_id: APP_ID,
            client_secret: APP_SECRET,
            redirect_uri: REDIRECT_URI,
            code,
        });
        const shortRes = await fetch(`${BASE_URL}/oauth/access_token?${tokenParams.toString()}`);
        if (!shortRes.ok) {
            const err = await shortRes.text();
            throw new Error(`Meta token exchange failed: ${err}`);
        }
        const shortData = await shortRes.json();

        // Step 2: Exchange for long-lived token
        const longParams = new URLSearchParams({
            grant_type: 'fb_exchange_token',
            client_id: APP_ID,
            client_secret: APP_SECRET,
            fb_exchange_token: shortData.access_token,
        });
        const longRes = await fetch(`${BASE_URL}/oauth/access_token?${longParams.toString()}`);
        if (!longRes.ok) {
            const err = await longRes.text();
            throw new Error(`Meta long-lived token exchange failed: ${err}`);
        }
        const longData = await longRes.json();

        await prisma.integration.create({
            data: {
                brandId,
                provider: 'meta_ads',
                accessToken: encrypt(longData.access_token),
                refreshToken: null,
                customerId: null,
                accountName: null,
                status: 'connected',
            },
        });

        return longData;
    },

    getAdAccounts: async (accessToken: string) => {
        const token = isEncrypted(accessToken) ? decrypt(accessToken) : accessToken;
        const url = `${BASE_URL}/me/adaccounts?fields=id,name,account_id,account_status&access_token=${token}`;
        const res = await fetch(url);
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Meta ad accounts fetch failed: ${err}`);
        }
        const data = await res.json();
        // Filter to active accounts only (account_status 1 = ACTIVE)
        return (data.data || []).filter((a: any) => a.account_status === 1);
    },
};
