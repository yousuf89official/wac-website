import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const packages = await prisma.servicePackage.findMany({
            include: { service: true },
            orderBy: { order: 'asc' },
        });
        return NextResponse.json(packages);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching service packages' }, { status: 500 });
    }
}
