import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// PATCH /api/users/[id]/status — Update user status (Active, Suspended, Inactive)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { id } = await params;
        const { status } = await request.json();

        const validStatuses = ['Active', 'Pending', 'Suspended', 'Inactive', 'Archive'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status. Must be: Active, Pending, Suspended, Inactive, or Archive' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prevent modifying super_admin
        if (user.role === 'super_admin') {
            return NextResponse.json({ error: 'Cannot modify super admin status' }, { status: 403 });
        }

        const updated = await prisma.user.update({
            where: { id },
            data: { status },
            select: { id: true, name: true, email: true, role: true, status: true }
        });

        await logActivity({
            userName: 'Admin',
            userEmail: 'system',
            action: 'update',
            target: 'User',
            detail: `Changed ${updated.name || updated.email} status to ${status}`,
            severity: status === 'Suspended' ? 'warning' : 'info',
        });

        return NextResponse.json(updated);
    } catch (err) {
        console.error('Status update error:', err);
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }
}
