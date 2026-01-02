import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { sessionId, type, data } = await req.json();

        let session = await prisma.visitorSession.findUnique({ where: { id: sessionId } });
        if (!session) {
            session = await prisma.visitorSession.create({
                data: { id: sessionId, ipAddress: "unknown", userAgent: "next-server" } // Next.js middleware required for real IP
            });
        }

        await prisma.visitorEvent.create({
            data: {
                sessionId: session.id,
                type,
                data: data ? JSON.stringify(data) : undefined
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Tracking Error:', error);
        return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
    }
}
