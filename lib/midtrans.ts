import midtransClient from 'midtrans-client';
import crypto from 'crypto';

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

export const snap = new midtransClient.Snap({
    isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

export const coreApi = new midtransClient.CoreApi({
    isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

/**
 * Generate a unique order ID for Midtrans.
 * Format: WAC-{timestamp}-{random}
 */
export function generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `WAC-${timestamp}-${random}`;
}

/**
 * Verify Midtrans webhook signature.
 * SHA512(order_id + status_code + gross_amount + server_key)
 */
export function verifySignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string
): boolean {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const payload = orderId + statusCode + grossAmount + serverKey;
    const hash = crypto.createHash('sha512').update(payload).digest('hex');
    return hash === signatureKey;
}

/**
 * Get the Snap.js script URL based on environment.
 */
export function getSnapScriptUrl(): string {
    return isProduction
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
}
