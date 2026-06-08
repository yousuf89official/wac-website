import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('ci_session')?.value || 'unknown';

        await prisma.sessionDetail.updateMany({
            where: { sessionId },
            data: {
                totalDuration: body.totalDuration || 0,
                pageCount: body.pageCount || 1,
                lastActivity: new Date(),
                ...(body.exitPage ? { exitPage: body.exitPage } : {}),
            },
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
