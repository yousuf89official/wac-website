import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;
    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

        const data = await prisma.ttExtraction.findMany({
            where: { userId: session!.user.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch history';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
