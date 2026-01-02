import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const globalSeo = await prisma.globalSeo.findFirst();
        return NextResponse.json(globalSeo || {}); // Return empty obj if null, to handle graceful frontend loading
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching global seo' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        // Upsert with ID 1 usually
        const exists = await prisma.globalSeo.findFirst();

        const globalSeo = await prisma.globalSeo.upsert({
            where: { id: exists?.id || 1 },
            update: body,
            create: {
                id: 1, // Force ID 1 if creating specific singleton
                ...body
            }
        });
        return NextResponse.json(globalSeo);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating global seo' }, { status: 500 });
    }
}
