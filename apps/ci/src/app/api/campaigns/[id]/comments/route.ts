import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// GET /api/campaigns/:id/comments — List comments for a campaign
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;

    try {
        const { id } = await props.params;

        const comments = await prisma.campaignComment.findMany({
            where: { campaignId: id },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(comments);
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}

// POST /api/campaigns/:id/comments — Add a comment to a campaign
export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { id } = await props.params;
        const body = await request.json();
        const { content } = body;

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
        }

        const comment = await prisma.campaignComment.create({
            data: {
                campaignId: id,
                userId: session!.user.id,
                userName: session!.user.name || 'User',
                content: content.trim(),
            },
        });

        await logActivity({
            userId: session?.user?.id,
            userName: session?.user?.name || 'User',
            userEmail: session?.user?.email || '',
            action: 'create',
            target: 'Campaign',
            detail: `Added comment on campaign ${id}`,
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
