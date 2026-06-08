import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

// GET /api/activity-logs — Fetch activity logs from database
export async function GET(request: Request) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { searchParams } = new URL(request.url);
        const severity = searchParams.get('severity');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');

        const where: any = {};

        if (severity && severity !== 'all') {
            where.severity = severity;
        }

        if (search) {
            where.OR = [
                { userName: { contains: search, mode: 'insensitive' } },
                { detail: { contains: search, mode: 'insensitive' } },
                { target: { contains: search, mode: 'insensitive' } },
                { action: { contains: search, mode: 'insensitive' } },
            ];
        }

        const logs = await prisma.activityLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return NextResponse.json(logs);
    } catch (err) {
        console.error('Activity logs error:', err);
        return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
    }
}
