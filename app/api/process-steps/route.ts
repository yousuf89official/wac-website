import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { processStepCreateSchema } from '@/lib/validations';

export async function GET() {
    try {
        const steps = await prisma.processStep.findMany({ orderBy: { order: 'asc' } });
        return NextResponse.json(steps);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching process steps' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    try {
        const raw = await req.json();
        const parsed = processStepCreateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const step = await prisma.processStep.create({ data: parsed.data });
        return NextResponse.json(step);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating process step' }, { status: 500 });
    }
}
