import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { serviceCreateSchema } from '@/lib/validations';

export async function GET() {
    try {
        const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
        return NextResponse.json(services);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching services' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    try {
        const raw = await req.json();
        const parsed = serviceCreateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const service = await prisma.service.create({ data: parsed.data });
        return NextResponse.json(service);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating service' }, { status: 500 });
    }
}
