import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { navLinkCreateSchema } from '@/lib/validations';

export async function GET() {
    try {
        const navLinks = await prisma.navLink.findMany({ orderBy: { order: 'asc' } });
        return NextResponse.json(navLinks);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching navigation links' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    try {
        const raw = await req.json();
        const parsed = navLinkCreateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const navLink = await prisma.navLink.create({ data: parsed.data });
        return NextResponse.json(navLink);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating navigation link' }, { status: 500 });
    }
}
