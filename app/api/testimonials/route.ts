import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { testimonialCreateSchema } from '@/lib/validations';

export async function GET() {
    try {
        const testimonials = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
        return NextResponse.json(testimonials);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching testimonials' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    try {
        const raw = await req.json();
        const parsed = testimonialCreateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const testimonial = await prisma.testimonial.create({ data: parsed.data });
        return NextResponse.json(testimonial);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating testimonial' }, { status: 500 });
    }
}
