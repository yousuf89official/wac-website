import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const { id } = await params;
        await prisma.igExtraction.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Delete failed';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
