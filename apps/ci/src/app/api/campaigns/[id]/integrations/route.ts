import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// GET /api/campaigns/[id]/integrations — List linked integrations for a campaign
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error } = await requireAuth();
    if (error) return error;

    try {
        const { id } = await params;

        const links = await prisma.campaignIntegration.findMany({
            where: { campaignId: id },
            include: {
                integration: {
                    select: { id: true, provider: true, accountName: true, customerId: true, status: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(links);
    } catch (err: any) {
        return NextResponse.json({ error: 'Failed to fetch campaign integrations' }, { status: 500 });
    }
}

// POST /api/campaigns/[id]/integrations — Link an integration to a campaign
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { id } = await params;
        const { integrationId, externalCampaignId, externalName } = await request.json();

        if (!integrationId) {
            return NextResponse.json({ error: 'integrationId is required' }, { status: 400 });
        }

        // Verify campaign and integration exist
        const [campaign, integration] = await Promise.all([
            prisma.campaign.findUnique({ where: { id }, select: { id: true, name: true, brandId: true } }),
            prisma.integration.findUnique({ where: { id: integrationId }, select: { id: true, provider: true, brandId: true, accountName: true } }),
        ]);

        if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        if (!integration) return NextResponse.json({ error: 'Integration not found' }, { status: 404 });

        // Verify they belong to the same brand
        if (campaign.brandId !== integration.brandId) {
            return NextResponse.json({ error: 'Campaign and integration must belong to the same brand' }, { status: 400 });
        }

        const link = await prisma.campaignIntegration.upsert({
            where: { integrationId_campaignId: { integrationId, campaignId: id } },
            create: {
                integrationId,
                campaignId: id,
                externalCampaignId: externalCampaignId || null,
                externalName: externalName || null,
            },
            update: {
                externalCampaignId: externalCampaignId || undefined,
                externalName: externalName || undefined,
                isActive: true,
            },
            include: {
                integration: { select: { provider: true, accountName: true } },
            },
        });

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'User',
            userEmail: session!.user.email || '',
            action: 'create',
            target: 'CampaignIntegration',
            detail: `Linked ${integration.provider} (${integration.accountName || integration.id}) to campaign "${campaign.name}"`,
        });

        return NextResponse.json(link, { status: 201 });
    } catch (err: any) {
        if (err.code === 'P2002') {
            return NextResponse.json({ error: 'This integration is already linked to this campaign' }, { status: 409 });
        }
        console.error('Campaign integration link error:', err);
        return NextResponse.json({ error: err.message || 'Failed to link integration' }, { status: 500 });
    }
}

// DELETE /api/campaigns/[id]/integrations — Unlink an integration
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { id } = await params;
        const { integrationId } = await request.json();

        if (!integrationId) {
            return NextResponse.json({ error: 'integrationId is required' }, { status: 400 });
        }

        await prisma.campaignIntegration.deleteMany({
            where: { campaignId: id, integrationId },
        });

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'User',
            userEmail: session!.user.email || '',
            action: 'delete',
            target: 'CampaignIntegration',
            detail: `Unlinked integration ${integrationId} from campaign ${id}`,
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: 'Failed to unlink integration' }, { status: 500 });
    }
}
