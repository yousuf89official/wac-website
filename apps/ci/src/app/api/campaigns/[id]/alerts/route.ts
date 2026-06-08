import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

const VALID_METRICS = ['spend', 'cpa', 'ctr', 'roas'];
const VALID_OPERATORS = ['gt', 'lt', 'gte', 'lte'];

export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;

    const { id } = await props.params;

    const alerts = await prisma.campaignAlert.findMany({
        where: { campaignId: id },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(alerts);
}

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { id } = await props.params;
    const body = await request.json();
    const { type, metric, operator, threshold } = body;

    if (!type || !metric || !operator || threshold === undefined) {
        return NextResponse.json({ error: 'type, metric, operator, and threshold are required' }, { status: 400 });
    }
    if (!VALID_METRICS.includes(metric)) {
        return NextResponse.json({ error: `Invalid metric. Must be one of: ${VALID_METRICS.join(', ')}` }, { status: 400 });
    }
    if (!VALID_OPERATORS.includes(operator)) {
        return NextResponse.json({ error: `Invalid operator. Must be one of: ${VALID_OPERATORS.join(', ')}` }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id }, select: { name: true } });
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    const alert = await prisma.campaignAlert.create({
        data: { campaignId: id, type, metric, operator, threshold, createdBy: session!.user.id },
    });

    await logActivity({
        userId: session!.user.id,
        userName: session!.user.name || 'User',
        userEmail: session!.user.email || '',
        action: 'create',
        target: 'CampaignAlert',
        detail: `Created ${type} alert: ${metric} ${operator} ${threshold} for "${campaign.name}"`,
    });

    return NextResponse.json(alert, { status: 201 });
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { alertId, isActive } = body;

    if (!alertId || isActive === undefined) {
        return NextResponse.json({ error: 'alertId and isActive are required' }, { status: 400 });
    }

    const updated = await prisma.campaignAlert.update({
        where: { id: alertId },
        data: { isActive },
    });

    return NextResponse.json(updated);
}
