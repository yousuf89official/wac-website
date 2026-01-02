import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const navLinks = await prisma.navLink.findMany({ orderBy: { order: 'asc' } });
        return NextResponse.json(navLinks);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching navigation links' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const navLink = await prisma.navLink.create({ data: body });
        return NextResponse.json(navLink);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating navigation link' }, { status: 500 });
    }
}
