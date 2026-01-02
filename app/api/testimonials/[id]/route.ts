import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await req.json();
        const testimonial = await prisma.testimonial.update({
            where: { id: parseInt(params.id) },
            data: body
        });
        return NextResponse.json(testimonial);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating testimonial' }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await prisma.testimonial.delete({ where: { id: parseInt(params.id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting testimonial' }, { status: 500 });
    }
}
