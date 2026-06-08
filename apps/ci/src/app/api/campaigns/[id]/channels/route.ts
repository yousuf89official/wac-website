import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// GET /api/campaigns/:id/channels
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const params = await props.params;
        const { id } = params;
        const relations = await prisma.campaignChannel.findMany({
            where: { campaignId: id },
            include: { channel: true }
        });
        return NextResponse.json(relations.map((r: any) => r.channel));
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/campaigns/:id/channels
export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const params = await props.params;
        const { id } = params;
        const { channelIds } = await request.json(); // Array of strings

        // Transaction to replace channels
        await prisma.$transaction(async (tx: any) => {
            // Delete existing
            await tx.campaignChannel.deleteMany({ where: { campaignId: id } });

            // Create new
            for (const channelId of channelIds) {
                await tx.campaignChannel.create({
                    data: {
                        campaignId: id,
                        channelId
                    }
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
