import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// GET /api/campaigns/:id
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const { id } = await props.params;
        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: {
                subCampaigns: {
                    include: { channels: { include: { channel: true } } },
                },
                channels: { include: { channel: true } },
            },
        });

        if (campaign) return NextResponse.json(campaign);

        // Fallback: check sub-campaign
        const sub = await prisma.subCampaign.findUnique({ where: { id } });
        if (sub) return NextResponse.json(sub);

        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT /api/campaigns/:id — Partial update (only provided fields are changed)
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error, session } = await requireAuth();
    if (error) return error;
    try {
        const { id } = await props.params;
        const body = await request.json();

        // Build update object from provided fields only
        const data: any = {};
        if (body.name !== undefined) {
            data.name = body.name;
            data.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }
        if (body.description !== undefined) data.description = body.description;
        if (body.status !== undefined) data.status = body.status;
        if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null;
        if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
        if (body.budgetPlanned !== undefined) data.budgetPlanned = parseFloat(body.budgetPlanned);
        if (body.currency !== undefined) data.currency = body.currency;
        if (body.timezone !== undefined) data.timezone = body.timezone;

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        // Check if sub-campaign first
        const sub = await prisma.subCampaign.findUnique({ where: { id } });

        if (sub) {
            // Sub-campaign specific fields
            if (body.region !== undefined) data.region = body.region;
            if (body.country !== undefined) data.country = body.country;
            if (body.targetAudience !== undefined) data.targetAudience = typeof body.targetAudience === 'string' ? body.targetAudience : JSON.stringify(body.targetAudience);
            if (body.configuration !== undefined) data.configuration = typeof body.configuration === 'string' ? body.configuration : JSON.stringify(body.configuration);

            const updated = await prisma.subCampaign.update({ where: { id }, data });
            return NextResponse.json(updated);
        }

        // Main campaign update
        const updated = await prisma.campaign.update({
            where: { id },
            data,
            include: { subCampaigns: true, channels: { include: { channel: true } } },
        });

        await logActivity({
            userId: session?.user?.id,
            userName: session?.user?.name || 'User',
            userEmail: session?.user?.email || '',
            action: 'update',
            target: 'Campaign',
            detail: `Updated campaign "${updated.name}" — ${Object.keys(data).join(', ')}`,
        });

        return NextResponse.json(updated);
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to update campaign' }, { status: 500 });
    }
}

// DELETE /api/campaigns/:id
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error, session } = await requireAuth();
    if (error) return error;
    try {
        const { id } = await props.params;

        // Check sub-campaign first
        const sub = await prisma.subCampaign.findUnique({ where: { id } });
        if (sub) {
            await prisma.$transaction([
                prisma.metric.deleteMany({ where: { subCampaignId: id } }),
                prisma.subCampaignChannel.deleteMany({ where: { subCampaignId: id } }),
                prisma.subCampaign.delete({ where: { id } }),
            ]);
            return NextResponse.json({ success: true });
        }

        // Main campaign — cascade delete
        const campaign = await prisma.campaign.findUnique({ where: { id }, select: { name: true } });
        await prisma.$transaction([
            prisma.metric.deleteMany({ where: { campaignId: id } }),
            prisma.subCampaignChannel.deleteMany({ where: { subCampaign: { campaignId: id } } }),
            prisma.campaignChannel.deleteMany({ where: { campaignId: id } }),
            prisma.subCampaign.deleteMany({ where: { campaignId: id } }),
            prisma.campaign.delete({ where: { id } }),
        ]);

        await logActivity({
            userId: session?.user?.id,
            userName: session?.user?.name || 'User',
            userEmail: session?.user?.email || '',
            action: 'delete',
            target: 'Campaign',
            detail: `Deleted campaign "${campaign?.name || id}"`,
            severity: 'warning',
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
