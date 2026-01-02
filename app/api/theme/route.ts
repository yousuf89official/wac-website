import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const theme = await prisma.themeConfig.upsert({
            where: { id: 1 },
            update: body,
            create: {
                id: 1,
                primaryColor: body.primaryColor || '#00f0ff',
                secondaryColor: body.secondaryColor || '#b000ff',
                accentColor: body.accentColor || '#ff006e',
                backgroundColor: body.backgroundColor || '#0a0a0a',
                cardBackground: body.cardBackground || '#1a1a1a',
                sectionPadding: body.sectionPadding || '2rem'
            }
        });
        return NextResponse.json(theme);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating theme' }, { status: 500 });
    }
}
