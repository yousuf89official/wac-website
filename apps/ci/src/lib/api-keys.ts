/**
 * Public API Key Authentication & Rate Limiting
 *
 * API keys use the format: ci_{env}_{random32chars}
 * Only the SHA256 hash is stored in the database.
 * The full key is shown once on creation and never again.
 */

import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Generate a new API key. Returns the full key (show once) and the hash (store).
 */
export function generateApiKey(env: 'prod' | 'stg' | 'dev' = 'prod'): { fullKey: string; prefix: string; hash: string } {
    const random = randomBytes(24).toString('hex'); // 48 chars
    const prefix = `ci_${env}_`;
    const fullKey = `${prefix}${random}`;
    const hash = createHash('sha256').update(fullKey).digest('hex');
    return { fullKey, prefix, hash };
}

/**
 * Hash an API key for lookup.
 */
export function hashApiKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
}

/**
 * Authenticate a request using an API key from the Authorization header.
 * Returns the authenticated API key record or an error response.
 */
export async function authenticateApiKey(request: Request): Promise<{
    error: NextResponse | null;
    apiKey: any | null;
    user: any | null;
}> {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
        return { error: NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 }), apiKey: null, user: null };
    }

    let key: string;
    if (authHeader.startsWith('Bearer ')) {
        key = authHeader.slice(7);
    } else {
        key = authHeader;
    }

    if (!key.startsWith('ci_')) {
        return { error: NextResponse.json({ error: 'Invalid API key format' }, { status: 401 }), apiKey: null, user: null };
    }

    const hash = hashApiKey(key);
    const apiKey = await prisma.apiKey.findUnique({
        where: { hashedKey: hash },
        include: { user: { select: { id: true, name: true, email: true, role: true, status: true } } },
    });

    if (!apiKey) {
        return { error: NextResponse.json({ error: 'Invalid API key' }, { status: 401 }), apiKey: null, user: null };
    }

    if (apiKey.status !== 'active') {
        return { error: NextResponse.json({ error: `API key is ${apiKey.status}` }, { status: 403 }), apiKey: null, user: null };
    }

    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
        return { error: NextResponse.json({ error: 'API key has expired' }, { status: 403 }), apiKey: null, user: null };
    }

    if (apiKey.user.status !== 'Active') {
        return { error: NextResponse.json({ error: 'Account is not active' }, { status: 403 }), apiKey: null, user: null };
    }

    // Rate limiting
    const now = Date.now();
    const limitKey = `ratelimit:${apiKey.id}`;
    const entry = rateLimitStore.get(limitKey);

    if (entry && entry.resetAt > now) {
        if (entry.count >= apiKey.rateLimit) {
            return {
                error: NextResponse.json(
                    { error: 'Rate limit exceeded', limit: apiKey.rateLimit, retry_after_ms: entry.resetAt - now },
                    { status: 429, headers: { 'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)), 'X-RateLimit-Limit': String(apiKey.rateLimit), 'X-RateLimit-Remaining': '0' } }
                ),
                apiKey: null, user: null,
            };
        }
        entry.count++;
    } else {
        rateLimitStore.set(limitKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    }

    // Update last used (fire and forget)
    prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date(), requestCount: { increment: 1 } },
    }).catch(() => {});

    return { error: null, apiKey, user: apiKey.user };
}

/**
 * Check if an API key has a required scope.
 */
export function hasScope(apiKey: any, requiredScope: string): boolean {
    const scopes: string[] = JSON.parse(apiKey.scopes || '[]');
    if (scopes.includes('admin')) return true;
    return scopes.includes(requiredScope);
}
