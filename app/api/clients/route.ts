import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const clients = await prisma.client.findMany({ orderBy: { order: 'asc' } });
        return NextResponse.json(clients);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching clients' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const client = await prisma.client.create({ data: body });
        return NextResponse.json(client);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
