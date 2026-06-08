import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// PATCH /api/api-keys/[id] — Update key (name, status, scopes, rateLimit)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { id } = await params;
        const body = await request.json();

        const key = await prisma.apiKey.findUnique({ where: { id } });
        if (!key || key.userId !== session!.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const data: any = {};
        if (body.name) data.name = body.name;
        if (body.status && ['active', 'inactive', 'revoked'].includes(body.status)) data.status = body.status;
        if (body.scopes && Array.isArray(body.scopes)) data.scopes = JSON.stringify(body.scopes);
        if (body.rateLimit && typeof body.rateLimit === 'number') data.rateLimit = body.rateLimit;

        const updated = await prisma.apiKey.update({ where: { id }, data });

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'User',
            userEmail: session!.user.email || '',
            action: 'update',
            target: 'ApiKey',
            detail: `Updated API key "${updated.name}" — ${Object.keys(data).join(', ')}`,
        });

        return NextResponse.json({ ...updated, scopes: JSON.parse(updated.scopes) });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to update' }, { status: 500 });
    }
}

// DELETE /api/api-keys/[id] — Revoke and delete key
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { id } = await params;

        const key = await prisma.apiKey.findUnique({ where: { id } });
        if (!key || key.userId !== session!.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        await prisma.apiKey.delete({ where: { id } });

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'User',
            userEmail: session!.user.email || '',
            action: 'delete',
            target: 'ApiKey',
            detail: `Revoked API key "${key.name}" (${key.prefix}***)`,
            severity: 'warning',
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to delete' }, { status: 500 });
    }
}
