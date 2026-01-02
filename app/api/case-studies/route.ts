import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const studies = await prisma.caseStudy.findMany({ orderBy: { order: 'asc' } });
        return NextResponse.json(studies);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching case studies' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const study = await prisma.caseStudy.create({ data: body });
        return NextResponse.json(study);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
