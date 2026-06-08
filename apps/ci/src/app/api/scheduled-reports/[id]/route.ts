import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// PATCH /api/scheduled-reports/[id] — Update or toggle a scheduled report
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { id } = await params;
        const body = await request.json();

        const report = await prisma.scheduledReport.findUnique({ where: { id } });
        if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const isAdmin = ['admin', 'super_admin', 'masteradmin'].includes(session!.user.role?.toLowerCase());
        if (report.userId !== session!.user.id && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const allowedFields = ['recipientEmails', 'frequency', 'dayOfWeek', 'dayOfMonth', 'hour',
                                'periodDays', 'includeScores', 'includeAnomalies', 'includeBenchmarks', 'isActive'];
        const data: any = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                data[field] = field === 'recipientEmails' ? JSON.stringify(body[field]) : body[field];
            }
        }

        const updated = await prisma.scheduledReport.update({ where: { id }, data });

        return NextResponse.json({ ...updated, recipientEmails: JSON.parse(updated.recipientEmails) });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to update' }, { status: 500 });
    }
}

// DELETE /api/scheduled-reports/[id] — Delete a scheduled report
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { id } = await params;

        const report = await prisma.scheduledReport.findUnique({ where: { id }, include: { brand: { select: { name: true } } } });
        if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const isAdmin = ['admin', 'super_admin', 'masteradmin'].includes(session!.user.role?.toLowerCase());
        if (report.userId !== session!.user.id && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.scheduledReport.delete({ where: { id } });

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'User',
            userEmail: session!.user.email || '',
            action: 'delete',
            target: 'ScheduledReport',
            detail: `Deleted scheduled report for ${report.brand?.name || report.brandId}`,
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to delete' }, { status: 500 });
    }
}
