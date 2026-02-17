import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { globalSeoSchema } from '@/lib/validations';

export async function GET() {
    try {
        const globalSeo = await prisma.globalSeo.findFirst();
        return NextResponse.json(globalSeo || {});
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching global seo' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    try {
        const raw = await req.json();
        const parsed = globalSeoSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const exists = await prisma.globalSeo.findFirst();
        const globalSeo = await prisma.globalSeo.upsert({
            where: { id: exists?.id || 1 },
            update: parsed.data,
            create: {
                id: 1,
                ...parsed.data
            }
        });
        return NextResponse.json(globalSeo);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating global seo' }, { status: 500 });
    }
}
