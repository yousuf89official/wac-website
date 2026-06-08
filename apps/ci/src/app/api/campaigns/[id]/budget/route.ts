import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;

    const { id } = await props.params;

    const allocations = await prisma.budgetAllocation.findMany({
        where: { campaignId: id },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(allocations);
}

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { id } = await props.params;
    const body = await request.json();
    const { subCampaignId, label, amount, percentage, period } = body;

    if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id }, select: { name: true } });
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    const allocation = await prisma.budgetAllocation.create({
        data: { campaignId: id, subCampaignId, label, amount, percentage, period: period || 'monthly' },
    });

    await logActivity({
        userId: session!.user.id,
        userName: session!.user.name || 'User',
        userEmail: session!.user.email || '',
        action: 'create',
        target: 'BudgetAllocation',
        detail: `Added ${period || 'monthly'} budget allocation of ${amount} for "${campaign.name}"`,
    });

    return NextResponse.json(allocation, { status: 201 });
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const allocationId = searchParams.get('allocationId');

    if (!allocationId) return NextResponse.json({ error: 'allocationId required' }, { status: 400 });

    await prisma.budgetAllocation.delete({ where: { id: allocationId } });
    return NextResponse.json({ success: true });
}
