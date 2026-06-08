import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// GET /api/creatives?brandId=X&campaignId=Y
export async function GET(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;

    try {
        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brandId');
        const campaignId = searchParams.get('campaignId');

        if (!brandId) return NextResponse.json({ error: 'brandId is required' }, { status: 400 });

        const where: any = { brandId, status: 'active' };
        if (campaignId) where.campaignId = campaignId;

        const creatives = await prisma.creative.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        return NextResponse.json(creatives);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch creatives' }, { status: 500 });
    }
}

// POST /api/creatives — Upload a creative asset (base64 data URL)
export async function POST(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const body = await request.json();
        const { name, type, url, brandId, campaignId, channelId, tags, mimeType, fileSize } = body;

        if (!name || !url || !brandId) {
            return NextResponse.json({ error: 'name, url, and brandId are required' }, { status: 400 });
        }

        // Validate file size (max 5MB for base64)
        if (url.length > 7_000_000) {
            return NextResponse.json({ error: 'File too large. Maximum 5MB.' }, { status: 413 });
        }

        const creative = await prisma.creative.create({
            data: {
                name,
                type: type || 'image',
                url,
                brandId,
                campaignId: campaignId || null,
                channelId: channelId || null,
                tags: tags ? JSON.stringify(tags) : null,
                mimeType: mimeType || null,
                fileSize: fileSize || null,
                createdBy: session!.user.id,
            },
        });

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'User',
            userEmail: session!.user.email || '',
            action: 'create',
            target: 'Creative',
            detail: `Uploaded creative "${name}" for brand ${brandId}${campaignId ? ` (campaign ${campaignId})` : ''}`,
        });

        return NextResponse.json(creative, { status: 201 });
    } catch (err: any) {
        console.error('Creative upload error:', err);
        return NextResponse.json({ error: err.message || 'Failed to upload creative' }, { status: 500 });
    }
}

// DELETE /api/creatives — Archive a creative (body: { id })
export async function DELETE(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

        await prisma.creative.update({
            where: { id },
            data: { status: 'archived' },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to delete creative' }, { status: 500 });
    }
}
