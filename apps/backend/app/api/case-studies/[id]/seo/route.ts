import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { seoUpdateSchema } from '@/lib/validations';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const params = await props.params;
    try {
        const raw = await req.json();
        const parsed = seoUpdateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const study = await prisma.caseStudy.update({
            where: { id: parseInt(params.id) },
            data: parsed.data
        });
        return NextResponse.json(study);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating case study seo' }, { status: 500 });
    }
}
