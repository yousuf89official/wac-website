import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/auth-customer';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireCustomer();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const resourceId = Number(id);
    if (!Number.isInteger(resourceId)) {
        return NextResponse.json({ error: 'Invalid resource id' }, { status: 400 });
    }

    const resource = await prisma.savedResource.findUnique({
        where: { id: resourceId },
        select: { customerId: true },
    });

    if (!resource) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    if (resource.customerId !== auth.customerId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.savedResource.delete({ where: { id: resourceId } });
    return NextResponse.json({ success: true });
}

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireCustomer();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const resourceId = Number(id);
    if (!Number.isInteger(resourceId)) {
        return NextResponse.json({ error: 'Invalid resource id' }, { status: 400 });
    }

    const resource = await prisma.savedResource.findUnique({
        where: { id: resourceId },
        select: { customerId: true },
    });

    if (!resource) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    if (resource.customerId !== auth.customerId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.savedResource.update({
        where: { id: resourceId },
        data: { downloadedAt: new Date() },
    });

    return NextResponse.json({ resource: updated });
}
