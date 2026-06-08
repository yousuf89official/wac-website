import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// GET /api/campaigns/sub/:id (id is parentId)
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const params = await props.params;
        const { id } = params; // This is campaignId (parent)

        const subCampaigns = await prisma.subCampaign.findMany({
            where: { campaignId: id }
        });

        return NextResponse.json(subCampaigns);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
