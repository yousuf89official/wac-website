import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { sectionUpdateSchema } from '@/lib/validations';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const params = await props.params;
    try {
        const raw = await req.json();
        const parsed = sectionUpdateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const section = await prisma.sectionContent.upsert({
            where: { sectionId: params.id },
            update: parsed.data,
            create: { sectionId: params.id, ...parsed.data, headline: parsed.data.headline || '' },
        });
        return NextResponse.json(section);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating section' }, { status: 500 });
    }
}
