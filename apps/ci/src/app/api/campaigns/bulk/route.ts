import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

const VALID_ACTIONS = ['pause', 'activate', 'archive', 'delete'] as const;
type BulkAction = typeof VALID_ACTIONS[number];

// POST /api/campaigns/bulk — Bulk operations on campaigns
export async function POST(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const body = await request.json();
        const { action, campaignIds } = body;

        if (!action || !VALID_ACTIONS.includes(action)) {
            return NextResponse.json({
                error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}`,
            }, { status: 400 });
        }

        if (!campaignIds || !Array.isArray(campaignIds) || campaignIds.length === 0) {
            return NextResponse.json({ error: 'campaignIds must be a non-empty array' }, { status: 400 });
        }

        const bulkAction = action as BulkAction;

        if (bulkAction === 'delete') {
            // Cascade delete each campaign within a transaction
            await prisma.$transaction([
                prisma.campaignComment.deleteMany({ where: { campaignId: { in: campaignIds } } }),
                prisma.metric.deleteMany({ where: { campaignId: { in: campaignIds } } }),
                prisma.subCampaignChannel.deleteMany({ where: { subCampaign: { campaignId: { in: campaignIds } } } }),
                prisma.metric.deleteMany({ where: { subCampaign: { campaignId: { in: campaignIds } } } }),
                prisma.subCampaign.deleteMany({ where: { campaignId: { in: campaignIds } } }),
                prisma.campaignIntegration.deleteMany({ where: { campaignId: { in: campaignIds } } }),
                prisma.campaignChannel.deleteMany({ where: { campaignId: { in: campaignIds } } }),
                prisma.campaign.deleteMany({ where: { id: { in: campaignIds } } }),
            ]);
        } else {
            const statusMap: Record<string, string> = {
                pause: 'Paused',
                activate: 'Active',
                archive: 'Archive',
            };

            await prisma.$transaction([
                prisma.campaign.updateMany({
                    where: { id: { in: campaignIds } },
                    data: { status: statusMap[bulkAction] },
                }),
            ]);
        }

        // Log each action individually
        for (const campaignId of campaignIds) {
            await logActivity({
                userId: session?.user?.id,
                userName: session?.user?.name || 'User',
                userEmail: session?.user?.email || '',
                action: bulkAction === 'delete' ? 'delete' : 'update',
                target: 'Campaign',
                detail: `Bulk ${bulkAction} on campaign ${campaignId}`,
                severity: bulkAction === 'delete' ? 'warning' : 'info',
            });
        }

        return NextResponse.json({ processed: campaignIds.length, action: bulkAction });
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
