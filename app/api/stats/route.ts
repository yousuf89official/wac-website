import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const stats = await prisma.stat.findMany({ orderBy: { order: 'asc' } });
        return NextResponse.json(stats);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const stat = await prisma.stat.create({ data: body });
        return NextResponse.json(stat);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating stat' }, { status: 500 });
    }
}
