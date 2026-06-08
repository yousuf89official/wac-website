import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// POST /api/campaigns/from-template — Create a campaign from a template
export async function POST(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const body = await request.json();
        const { templateId, brandId, name } = body;

        if (!templateId || !brandId || !name) {
            return NextResponse.json({ error: 'templateId, brandId, and name are required' }, { status: 400 });
        }

        const template = await prisma.campaignTemplate.findUnique({ where: { id: templateId } });
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        let structure: any;
        try {
            structure = JSON.parse(template.structure);
        } catch {
            return NextResponse.json({ error: 'Template has invalid structure JSON' }, { status: 500 });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

        const campaign = await prisma.$transaction(async (tx: any) => {
            const budgetPlanned = structure.budgetSplits?.total
                ? parseFloat(structure.budgetSplits.total)
                : 0;

            const newCampaign = await tx.campaign.create({
                data: {
                    name: name.trim(),
                    slug,
                    brandId,
                    status: 'Draft',
                    approvalStatus: 'draft',
                    budgetPlanned,
                },
            });

            // Create sub-campaigns from template structure
            if (structure.subCampaigns && Array.isArray(structure.subCampaigns)) {
                for (const sub of structure.subCampaigns) {
                    const subSlug = (sub.name || 'sub').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
                    await tx.subCampaign.create({
                        data: {
                            name: sub.name || 'Sub Campaign',
                            slug: subSlug,
                            status: 'Draft',
                            description: sub.description || null,
                            budgetPlanned: sub.budget ? parseFloat(sub.budget) : 0,
                            region: sub.region || null,
                            country: sub.country || null,
                            campaignId: newCampaign.id,
                        },
                    });
                }
            }

            // Create channel links from template structure
            if (structure.channels && Array.isArray(structure.channels)) {
                for (const channelId of structure.channels) {
                    await tx.campaignChannel.create({
                        data: {
                            campaignId: newCampaign.id,
                            channelId,
                        },
                    });
                }
            }

            return newCampaign;
        });

        await logActivity({
            userId: session?.user?.id,
            userName: session?.user?.name || 'User',
            userEmail: session?.user?.email || '',
            action: 'create',
            target: 'Campaign',
            detail: `Created campaign "${name}" from template "${template.name}"`,
        });

        return NextResponse.json(campaign, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
