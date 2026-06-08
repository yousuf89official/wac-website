import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { navLinkUpdateSchema } from '@/lib/validations';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const params = await props.params;
    try {
        const raw = await req.json();
        const parsed = navLinkUpdateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const navLink = await prisma.navLink.update({
            where: { id: parseInt(params.id) },
            data: parsed.data
        });
        return NextResponse.json(navLink);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating navigation link' }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const params = await props.params;
    try {
        await prisma.navLink.delete({ where: { id: parseInt(params.id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting navigation link' }, { status: 500 });
    }
}
