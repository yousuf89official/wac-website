import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const testimonials = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
        return NextResponse.json(testimonials);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching testimonials' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const testimonial = await prisma.testimonial.create({ data: body });
        return NextResponse.json(testimonial);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating testimonial' }, { status: 500 });
    }
}
