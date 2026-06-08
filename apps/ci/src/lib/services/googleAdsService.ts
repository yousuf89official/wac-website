import { google } from 'googleapis';
import { prisma } from '../prisma';
import { randomUUID } from 'crypto';
import { encrypt, decrypt, isEncrypted } from '../encryption';

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID?.trim() || '';
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET?.trim() || '';
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim() || '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/integrations/google-ads/callback`
    : 'http://localhost:3000/integrations/google-ads/callback';

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

export const GoogleAdsService = {
    getAuthUrl: (brandId: string) => {
        const scopes = [
            'https://www.googleapis.com/auth/adwords'
        ];
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent', // Force refresh token
            state: JSON.stringify({ brandId })
        });
    },

    handleCallback: async (code: string, brandId: string) => {
        const { tokens } = await oauth2Client.getToken(code);

        // Store in DB
        // Check if pending integration exists or create new?
        // Logic from legacy: always create new 'connected'

        await prisma.integration.create({
            data: {
                brandId,
                provider: 'google_ads',
                accessToken: tokens.access_token ? encrypt(tokens.access_token) : null,
                refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
                customerId: null, // Pending selection
                accountName: null,
                status: 'connected'
            }
        });

        return tokens;
    },

    getAccessibleCustomers: async (refreshToken: string) => {
        // Decrypt token if encrypted
        const decryptedToken = isEncrypted(refreshToken) ? decrypt(refreshToken) : refreshToken;
        // Refresh the token first to get a fresh access token
        oauth2Client.setCredentials({ refresh_token: decryptedToken });
        const { token: accessToken } = await oauth2Client.getAccessToken();

        // Use v18 of the Google Ads API
        const url = 'https://googleads.googleapis.com/v18/customers:listAccessibleCustomers';

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'developer-token': DEVELOPER_TOKEN
                }
            });

            if (!response.ok) {
                const text = await response.text();
                console.error(`[GoogleAds] API Error Response (${response.status}):`, text);
                throw new Error(`Google Ads API Error (${response.status}): ${text}`);
            }

            const data = await response.json();
            return data.resourceNames; // ["customers/1234567890", ...]
        } catch (error) {
            console.error('[GoogleAds] Error listing customers:', error);
            throw error;
        }
    }
};
