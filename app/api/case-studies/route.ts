import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { caseStudyCreateSchema } from '@/lib/validations';

export async function GET() {
    try {
        const studies = await prisma.caseStudy.findMany({ orderBy: { order: 'asc' } });
        return NextResponse.json(studies);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching case studies' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    try {
        const raw = await req.json();
        const parsed = caseStudyCreateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const study = await prisma.caseStudy.create({ data: parsed.data });
        return NextResponse.json(study);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
