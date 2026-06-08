import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// GET /api/media-analysis — Fetch saved analyses (optional brandId/campaignId filter)
export async function GET(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brandId');
        const campaignId = searchParams.get('campaignId');

        const where: Record<string, string> = {};
        if (brandId) where.brandId = brandId;
        if (campaignId) where.campaignId = campaignId;

        const analyses = await prisma.mediaAnalysis.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(analyses);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Media analysis GET error:', message);
        return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 });
    }
}

// POST /api/media-analysis — Save a new analysis
export async function POST(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const body = await request.json();
        const { brandId, campaignId, name, inputs, results, aiAnalysis, channels } = body;

        if (!brandId || !name) {
            return NextResponse.json({ error: 'brandId and name are required' }, { status: 400 });
        }

        const created = await prisma.mediaAnalysis.create({
            data: {
                brandId,
                campaignId: campaignId || null,
                name,
                inputs: typeof inputs === 'string' ? inputs : JSON.stringify(inputs),
                results: typeof results === 'string' ? results : JSON.stringify(results),
                aiAnalysis: aiAnalysis || null,
                channels: channels ? (typeof channels === 'string' ? channels : JSON.stringify(channels)) : null,
                createdBy: session!.user.id,
            },
        });

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'Unknown',
            userEmail: session!.user.email || '',
            action: 'create',
            target: 'Media Analysis',
            detail: `Saved media analysis "${name}" for brand ${brandId}`,
        });

        return NextResponse.json(created, { status: 201 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Media analysis POST error:', message);
        return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 });
    }
}

// DELETE /api/media-analysis?id=xxx — Delete a saved analysis (verify ownership)
export async function DELETE(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        // Verify ownership
        const existing = await prisma.mediaAnalysis.findFirst({
            where: { id, createdBy: session!.user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
        }

        await prisma.mediaAnalysis.delete({ where: { id } });

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'Unknown',
            userEmail: session!.user.email || '',
            action: 'delete',
            target: 'Media Analysis',
            detail: `Deleted media analysis "${existing.name}"`,
        });

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Media analysis DELETE error:', message);
        return NextResponse.json({ error: 'Failed to delete analysis' }, { status: 500 });
    }
}
