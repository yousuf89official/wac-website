import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// PATCH /api/users/[id] — Update user role and permissions
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { id } = await params;
        const body = await request.json();

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.role === 'super_admin' || user.role === 'MasterAdmin') {
            return NextResponse.json({ error: 'Cannot modify super admin' }, { status: 403 });
        }

        const data: any = {};

        // Update role if provided
        if (body.role !== undefined) {
            const validRoles = ['admin', 'manager', 'analyst', 'editor', 'viewer', 'client'];
            if (!validRoles.includes(body.role)) {
                return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
            }
            data.role = body.role;
        }

        // Update permissions if provided (JSON string of feature keys)
        if (body.permissions !== undefined) {
            if (!Array.isArray(body.permissions)) {
                return NextResponse.json({ error: 'Permissions must be an array' }, { status: 400 });
            }
            data.permissions = JSON.stringify(body.permissions);
        }

        const updated = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true, name: true, email: true, role: true,
                workRole: true, status: true, permissions: true,
            }
        });

        const changes = [];
        if (body.role) changes.push(`role → ${body.role}`);
        if (body.permissions) changes.push(`permissions updated (${body.permissions.length} features)`);

        await logActivity({
            userName: 'Admin',
            userEmail: 'system',
            action: 'update',
            target: 'User',
            detail: `Updated ${updated.name || updated.email}: ${changes.join(', ')}`,
        });

        return NextResponse.json(updated);
    } catch (err) {
        console.error('User update error:', err);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
