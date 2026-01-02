import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const brand = await prisma.brandConfig.upsert({
            where: { id: 1 },
            update: body,
            create: {
                id: 1,
                name: body.name || 'Agency',
                tagline: body.tagline || '',
                logo: body.logo || '',
                defaultEmail: body.defaultEmail || '',
                domain: body.domain || ''
            }
        });
        return NextResponse.json(brand);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating brand' }, { status: 500 });
    }
}
