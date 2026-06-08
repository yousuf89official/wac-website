import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// POST /api/campaigns/:id/clone — Clone a campaign
export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { id } = await props.params;

        const original = await prisma.campaign.findUnique({
            where: { id },
            include: { subCampaigns: true, channels: true },
        });

        if (!original) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        const newName = `${original.name} (Copy)`;
        const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

        const newCampaign = await prisma.$transaction(async (tx: any) => {
            const campaign = await tx.campaign.create({
                data: {
                    name: newName,
                    slug,
                    description: original.description,
                    budgetPlanned: original.budgetPlanned,
                    currency: original.currency,
                    timezone: original.timezone,
                    status: 'Draft',
                    approvalStatus: 'draft',
                    brandId: original.brandId,
                    startDate: null,
                    endDate: null,
                },
            });

            // Clone sub-campaigns
            for (const sub of original.subCampaigns) {
                const subSlug = sub.slug + '-copy-' + Math.random().toString(36).substring(2, 6);
                await tx.subCampaign.create({
                    data: {
                        name: sub.name,
                        slug: subSlug,
                        status: 'Draft',
                        description: sub.description,
                        budgetPlanned: sub.budgetPlanned,
                        region: sub.region,
                        country: sub.country,
                        targetAudience: sub.targetAudience,
                        configuration: sub.configuration,
                        campaignId: campaign.id,
                    },
                });
            }

            // Clone channel links
            for (const ch of original.channels) {
                await tx.campaignChannel.create({
                    data: {
                        campaignId: campaign.id,
                        channelId: ch.channelId,
                    },
                });
            }

            return campaign;
        });

        await logActivity({
            userId: session?.user?.id,
            userName: session?.user?.name || 'User',
            userEmail: session?.user?.email || '',
            action: 'create',
            target: 'Campaign',
            detail: `Cloned campaign "${original.name}" → "${newName}"`,
        });

        return NextResponse.json(newCampaign, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
