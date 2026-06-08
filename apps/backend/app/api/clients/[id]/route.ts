import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { clientUpdateSchema } from '@/lib/validations';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const params = await props.params;
    try {
        const raw = await req.json();
        const parsed = clientUpdateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const client = await prisma.client.update({
            where: { id: parseInt(params.id) },
            data: parsed.data
        });
        return NextResponse.json(client);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating client' }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const params = await props.params;
    try {
        await prisma.client.delete({ where: { id: parseInt(params.id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting client' }, { status: 500 });
    }
}
