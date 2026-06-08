import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// GET /api/scheduled-reports — List user's scheduled reports
export async function GET() {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const isAdmin = ['admin', 'super_admin', 'masteradmin'].includes(session!.user.role?.toLowerCase());

        const reports = await prisma.scheduledReport.findMany({
            where: isAdmin ? {} : { userId: session!.user.id },
            include: { brand: { select: { id: true, name: true, slug: true } } },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(reports.map((r: any) => ({
            ...r,
            recipientEmails: JSON.parse(r.recipientEmails || '[]'),
        })));
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch scheduled reports' }, { status: 500 });
    }
}

// POST /api/scheduled-reports — Create a new scheduled report
export async function POST(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const body = await request.json();
        const { brandId, recipientEmails, frequency, dayOfWeek, dayOfMonth, hour, periodDays,
                includeScores, includeAnomalies, includeBenchmarks } = body;

        if (!brandId || !recipientEmails || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
            return NextResponse.json({ error: 'brandId and recipientEmails[] are required' }, { status: 400 });
        }

        // Validate emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        for (const email of recipientEmails) {
            if (!emailRegex.test(email)) {
                return NextResponse.json({ error: `Invalid email: ${email}` }, { status: 400 });
            }
        }

        // Verify brand exists
        const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { id: true, name: true } });
        if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });

        // Calculate next send time
        const nextSendAt = calculateNextSendTime(frequency || 'weekly', dayOfWeek || 1, dayOfMonth || 1, hour || 8);

        const report = await prisma.scheduledReport.create({
            data: {
                brandId,
                userId: session!.user.id,
                recipientEmails: JSON.stringify(recipientEmails),
                frequency: frequency || 'weekly',
                dayOfWeek: dayOfWeek ?? 1,
                dayOfMonth: dayOfMonth ?? 1,
                hour: hour ?? 8,
                periodDays: periodDays || 7,
                includeScores: includeScores !== false,
                includeAnomalies: includeAnomalies !== false,
                includeBenchmarks: includeBenchmarks !== false,
                nextSendAt,
            },
            include: { brand: { select: { id: true, name: true } } },
        });

        await logActivity({
            userId: session!.user.id,
            userName: session!.user.name || 'User',
            userEmail: session!.user.email || '',
            action: 'create',
            target: 'ScheduledReport',
            detail: `Scheduled ${frequency || 'weekly'} report for ${brand.name} → ${recipientEmails.join(', ')}`,
        });

        return NextResponse.json({ ...report, recipientEmails });
    } catch (err: any) {
        console.error('Scheduled report create error:', err);
        return NextResponse.json({ error: err.message || 'Failed to create schedule' }, { status: 500 });
    }
}

function calculateNextSendTime(frequency: string, dayOfWeek: number, dayOfMonth: number, hour: number): Date {
    const now = new Date();
    const next = new Date(now);
    next.setUTCHours(hour, 0, 0, 0);

    if (frequency === 'daily') {
        if (next <= now) next.setDate(next.getDate() + 1);
    } else if (frequency === 'weekly') {
        const currentDay = next.getUTCDay();
        const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 7;
        next.setDate(next.getDate() + daysUntil);
        if (next <= now) next.setDate(next.getDate() + 7);
    } else if (frequency === 'monthly') {
        next.setUTCDate(dayOfMonth);
        if (next <= now) next.setUTCMonth(next.getUTCMonth() + 1);
    }

    return next;
}
