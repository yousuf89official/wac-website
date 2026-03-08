import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { valueCreateSchema } from '@/lib/validations';

export async function GET() {
    try {
        const values = await prisma.value.findMany({ orderBy: { order: 'asc' } });
        return NextResponse.json(values);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching values' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    try {
        const raw = await req.json();
        const parsed = valueCreateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const value = await prisma.value.create({ data: parsed.data });
        return NextResponse.json(value);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating value' }, { status: 500 });
    }
}
