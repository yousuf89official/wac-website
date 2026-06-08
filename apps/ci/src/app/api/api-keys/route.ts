import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { generateApiKey } from '@/lib/api-keys';
import { logActivity } from '@/lib/activity-log';

// GET /api/api-keys — List user's API keys (without the actual key)
export async function GET() {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const keys = await prisma.apiKey.findMany({
            where: { userId: session!.user.id },
            select: {
                id: true, name: true, prefix: true, scopes: true, rateLimit: true,
                status: true, lastUsedAt: true, requestCount: true, expiresAt: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(keys.map((k: any) => ({
            ...k,
            scopes: JSON.parse(k.scopes || '[]'),
        })));
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
    }
}

// POST /api/api-keys — Generate a new API key
export async function POST(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const body = await request.json();
        const { name, scopes, rateLimit, env } = body;

        if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
        if (!scopes || !Array.isArray(scopes) || scopes.length === 0) {
            return NextResponse.json({ error: 'scopes[] is required' }, { status: 400 });
        }

        // Generate key
        const { fullKey, prefix, hash } = generateApiKey(env || 'prod');

        const apiKey = await prisma.apiKey.create({
            data: {
                name,
                prefix,
                hashedKey: hash,
                userId: session!.user.id,
                scopes: JSON.stringify(scopes),
                rateLimit: rateLimit || 1000,
            },
        });

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'User',
            userEmail: session!.user.email || '',
            action: 'create',
            target: 'ApiKey',
            detail: `Created API key "${name}" (${prefix}***) with scopes: ${scopes.join(', ')}`,
        });

        // Return the full key ONCE — it will never be shown again
        return NextResponse.json({
            id: apiKey.id,
            name: apiKey.name,
            key: fullKey, // ← Only returned on creation
            prefix: apiKey.prefix,
            scopes,
            rateLimit: apiKey.rateLimit,
            message: 'Save this key securely — it will not be shown again.',
        });
    } catch (err: any) {
        console.error('API key creation error:', err);
        return NextResponse.json({ error: err.message || 'Failed to create key' }, { status: 500 });
    }
}
