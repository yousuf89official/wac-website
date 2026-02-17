import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { brandUpdateSchema } from '@/lib/validations';

export async function PUT(req: Request) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    try {
        const raw = await req.json();
        const parsed = brandUpdateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const brand = await prisma.brandConfig.upsert({
            where: { id: 1 },
            update: parsed.data,
            create: {
                id: 1,
                name: parsed.data.name || 'Agency',
                tagline: parsed.data.tagline || '',
                logo: parsed.data.logo || '',
                defaultEmail: parsed.data.defaultEmail || '',
                domain: parsed.data.domain || ''
            }
        });
        return NextResponse.json(brand);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating brand' }, { status: 500 });
    }
}
