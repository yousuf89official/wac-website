import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { themeUpdateSchema } from '@/lib/validations';

export async function PUT(req: Request) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    try {
        const raw = await req.json();
        const parsed = themeUpdateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const theme = await prisma.themeConfig.upsert({
            where: { id: 1 },
            update: parsed.data,
            create: {
                id: 1,
                primaryColor: parsed.data.primaryColor || '#00f0ff',
                secondaryColor: parsed.data.secondaryColor || '#b000ff',
                accentColor: parsed.data.accentColor || '#ff006e',
                backgroundColor: parsed.data.backgroundColor || '#0a0a0a',
                cardBackground: parsed.data.cardBackground || '#1a1a1a',
                sectionPadding: parsed.data.sectionPadding || '2rem'
            }
        });
        return NextResponse.json(theme);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating theme' }, { status: 500 });
    }
}
