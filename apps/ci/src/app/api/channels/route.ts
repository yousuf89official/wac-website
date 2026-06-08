import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// GET /api/channels
export async function GET(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    const { searchParams } = new URL(request.url);
    const platformId = searchParams.get('platformId');
    try {
        const where = platformId ? { platformId } : {};
        const channels = await prisma.channel.findMany({ where });
        return NextResponse.json(channels);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/channels
export async function POST(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const { name, platformId } = await request.json();
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

        const channel = await prisma.channel.create({
            data: {
                name,
                slug,
                platformId
            }
        });
        return NextResponse.json(channel);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
