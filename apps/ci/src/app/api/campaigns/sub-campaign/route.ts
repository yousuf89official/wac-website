import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { requireAuth } from '@/lib/api-auth';

// POST /api/campaigns/sub-campaign
export async function POST(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const body = await request.json();
        const { campaignId, name, slug, status, description, startDate, endDate, budgetPlanned } = body;

        const sub = await prisma.subCampaign.create({
            data: {
                campaignId,
                name,
                slug,
                status: status || 'draft',
                description,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                budgetPlanned: parseFloat(budgetPlanned || 0),
            }
        });

        return NextResponse.json({ success: true, id: sub.id });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
