import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { statCreateSchema } from '@/lib/validations';

export async function GET() {
    try {
        const stats = await prisma.stat.findMany({ orderBy: { order: 'asc' } });
        return NextResponse.json(stats);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    try {
        const raw = await req.json();
        const parsed = statCreateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const stat = await prisma.stat.create({ data: parsed.data });
        return NextResponse.json(stat);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating stat' }, { status: 500 });
    }
}
