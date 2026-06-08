import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseCondition, parseAction } from '@/lib/rules-engine';

export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;

    const { id } = await props.params;

    const rule = await prisma.campaignRule.findUnique({
        where: { id },
        include: {
            campaign: { select: { name: true } },
            executions: { take: 10, orderBy: { createdAt: 'desc' } },
        },
    });

    if (!rule) return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    return NextResponse.json(rule);
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { id } = await props.params;
    const body = await request.json();

    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.frequency !== undefined) {
        if (!['hourly', 'daily'].includes(body.frequency)) {
            return NextResponse.json({ error: 'frequency must be "hourly" or "daily"' }, { status: 400 });
        }
        data.frequency = body.frequency;
    }
    if (body.consecutiveHits !== undefined) data.consecutiveHits = body.consecutiveHits;
    if (body.condition !== undefined) {
        try { parseCondition(body.condition); } catch (e: any) {
            return NextResponse.json({ error: `Invalid condition: ${e.message}` }, { status: 400 });
        }
        data.condition = body.condition;
    }
    if (body.action !== undefined) {
        try { parseAction(body.action); } catch (e: any) {
            return NextResponse.json({ error: `Invalid action: ${e.message}` }, { status: 400 });
        }
        data.action = body.action;
    }
    if (body.isActive !== undefined) {
        data.isActive = body.isActive;
        if (!body.isActive) data.currentHits = 0;
    }

    if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await prisma.campaignRule.update({ where: { id }, data });
    return NextResponse.json(updated);
}

export async function DELETE(_request: Request, props: { params: Promise<{ id: string }> }) {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { id } = await props.params;

    const rule = await prisma.campaignRule.findUnique({ where: { id }, select: { name: true } });
    if (!rule) return NextResponse.json({ error: 'Rule not found' }, { status: 404 });

    await prisma.$transaction([
        prisma.ruleExecution.deleteMany({ where: { ruleId: id } }),
        prisma.campaignRule.delete({ where: { id } }),
    ]);

    await logActivity({
        userId: session!.user.id,
        userName: session!.user.name || 'User',
        userEmail: session!.user.email || '',
        action: 'delete', target: 'CampaignRule',
        detail: `Deleted rule "${rule.name}"`,
        severity: 'warning',
    });

    return NextResponse.json({ success: true });
}
