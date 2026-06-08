import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

const VALID_TRANSITIONS: Record<string, string[]> = {
    draft: ['pending_review'],
    pending_review: ['approved', 'rejected'],
    approved: ['active'],
    rejected: ['draft'],
    active: ['paused', 'completed'],
    paused: ['active', 'completed'],
    completed: ['archived'],
};

// PUT /api/campaigns/:id/status — Transition campaign approval status
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { id } = await props.params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const campaign = await prisma.campaign.findUnique({ where: { id } });
        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        const currentStatus = campaign.approvalStatus;
        const allowed = VALID_TRANSITIONS[currentStatus];

        if (!allowed || !allowed.includes(status)) {
            return NextResponse.json({
                error: `Invalid status transition from "${currentStatus}" to "${status}". Allowed transitions: ${allowed?.join(', ') || 'none'}`,
            }, { status: 400 });
        }

        const data: any = { approvalStatus: status };

        // If transitioning to 'active', also set the campaign status to Active
        if (status === 'active') {
            data.status = 'Active';
        }

        const updated = await prisma.campaign.update({
            where: { id },
            data,
        });

        await logActivity({
            userId: session?.user?.id,
            userName: session?.user?.name || 'User',
            userEmail: session?.user?.email || '',
            action: 'update',
            target: 'Campaign',
            detail: `Changed approval status of "${updated.name}" from "${currentStatus}" to "${status}"`,
            severity: status === 'rejected' ? 'warning' : 'info',
        });

        return NextResponse.json(updated);
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
