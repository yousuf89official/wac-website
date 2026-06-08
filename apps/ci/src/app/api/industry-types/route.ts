import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const industries = await (prisma as any).industry.findMany({
            include: {
                subTypes: {
                    orderBy: { name: 'asc' }
                }
            },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(industries);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch industries' }, { status: 500 });
    }
}

