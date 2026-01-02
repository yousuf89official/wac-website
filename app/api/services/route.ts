import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
        return NextResponse.json(services);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching services' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const service = await prisma.service.create({ data: body });
        return NextResponse.json(service);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating service' }, { status: 500 });
    }
}
