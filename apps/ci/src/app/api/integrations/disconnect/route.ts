import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function POST(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const { id } = await request.json();
        const integration = await prisma.integration.delete({
            where: { id }
        });
        return NextResponse.json({ success: true, integration });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
    }
}
