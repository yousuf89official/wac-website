import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// PATCH /api/whitelabel/[id] — Update white-label domain settings
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { id } = await params;
        const body = await request.json();

        const domain = await prisma.whitelabelDomain.findUnique({ where: { id } });
        if (!domain) return NextResponse.json({ error: 'Domain not found' }, { status: 404 });

        // Only owner or admin can update
        const isAdmin = ['admin', 'super_admin', 'masteradmin'].includes(session!.user.role?.toLowerCase());
        if (domain.userId !== session!.user.id && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const allowedFields = ['brandName', 'logo', 'primaryColor', 'accentColor', 'favicon', 'customCss', 'loginMessage', 'isActive'];
        const data: any = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) data[field] = body[field];
        }

        const updated = await prisma.whitelabelDomain.update({ where: { id }, data });

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'User',
            userEmail: session!.user.email || '',
            action: 'update',
            target: 'WhitelabelDomain',
            detail: `Updated white-label: ${updated.domain} (${Object.keys(data).join(', ')})`,
        });

        return NextResponse.json(updated);
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to update' }, { status: 500 });
    }
}

// DELETE /api/whitelabel/[id] — Remove a white-label domain
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { id } = await params;

        const domain = await prisma.whitelabelDomain.findUnique({ where: { id } });
        if (!domain) return NextResponse.json({ error: 'Domain not found' }, { status: 404 });

        const isAdmin = ['admin', 'super_admin', 'masteradmin'].includes(session!.user.role?.toLowerCase());
        if (domain.userId !== session!.user.id && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.whitelabelDomain.delete({ where: { id } });

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'User',
            userEmail: session!.user.email || '',
            action: 'delete',
            target: 'WhitelabelDomain',
            detail: `Deleted white-label domain: ${domain.domain}`,
            severity: 'warning',
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to delete' }, { status: 500 });
    }
}
