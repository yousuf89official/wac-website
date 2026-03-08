import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { valueUpdateSchema } from '@/lib/validations';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const params = await props.params;
    try {
        const raw = await req.json();
        const parsed = valueUpdateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const value = await prisma.value.update({
            where: { id: parseInt(params.id) },
            data: parsed.data,
        });
        return NextResponse.json(value);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating value' }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const params = await props.params;
    try {
        await prisma.value.delete({ where: { id: parseInt(params.id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting value' }, { status: 500 });
    }
}
