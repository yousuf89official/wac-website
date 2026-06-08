import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { testimonialUpdateSchema } from '@/lib/validations';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const params = await props.params;
    try {
        const raw = await req.json();
        const parsed = testimonialUpdateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const testimonial = await prisma.testimonial.update({
            where: { id: parseInt(params.id) },
            data: parsed.data
        });
        return NextResponse.json(testimonial);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating testimonial' }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const params = await props.params;
    try {
        await prisma.testimonial.delete({ where: { id: parseInt(params.id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting testimonial' }, { status: 500 });
    }
}
