import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseCondition, parseAction } from '@/lib/rules-engine';

export async function GET(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    const where = campaignId ? { campaignId } : {};

    const rules = await prisma.campaignRule.findMany({
        where,
        include: { campaign: { select: { name: true, brandId: true } } },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rules);
}

export async function POST(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { campaignId, name, description, condition, action, frequency, consecutiveHits } = body;

    if (!campaignId || !name || !condition || !action) {
        return NextResponse.json({ error: 'campaignId, name, condition, and action are required' }, { status: 400 });
    }

    // Validate JSON shapes
    try { parseCondition(condition); } catch (e: any) {
        return NextResponse.json({ error: `Invalid condition: ${e.message}` }, { status: 400 });
    }
    try { parseAction(action); } catch (e: any) {
        return NextResponse.json({ error: `Invalid action: ${e.message}` }, { status: 400 });
    }

    if (frequency && !['hourly', 'daily'].includes(frequency)) {
        return NextResponse.json({ error: 'frequency must be "hourly" or "daily"' }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId }, select: { name: true } });
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    const rule = await prisma.campaignRule.create({
        data: {
            campaignId, name, description,
            condition, action,
            frequency: frequency || 'daily',
            consecutiveHits: consecutiveHits || 1,
            createdBy: session!.user.id,
        },
    });

    await logActivity({
        userId: session!.user.id,
        userName: session!.user.name || 'User',
        userEmail: session!.user.email || '',
        action: 'create', target: 'CampaignRule',
        detail: `Created rule "${name}" for campaign "${campaign.name}"`,
    });

    return NextResponse.json(rule, { status: 201 });
}
