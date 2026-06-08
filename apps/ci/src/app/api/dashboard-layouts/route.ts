import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// GET /api/dashboard-layouts — Fetch all layouts for the authenticated user
export async function GET() {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const layouts = await prisma.dashboardLayout.findMany({
            where: { userId: session!.user.id },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json(layouts);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Dashboard layouts GET error:', message);
        return NextResponse.json({ error: 'Failed to fetch layouts' }, { status: 500 });
    }
}

// POST /api/dashboard-layouts — Create a new saved layout
export async function POST(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const body = await request.json();
        const { name, layout, isDefault } = body;

        if (!layout || !Array.isArray(layout)) {
            return NextResponse.json({ error: 'layout must be a JSON array' }, { status: 400 });
        }

        const userId = session!.user.id;

        // If this layout should be the default, unset any existing default for this user
        if (isDefault) {
            await prisma.dashboardLayout.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        const created = await prisma.dashboardLayout.create({
            data: {
                userId,
                name: name || 'My Dashboard',
                layout: JSON.stringify(layout),
                isDefault: !!isDefault,
            },
        });

        return NextResponse.json(created, { status: 201 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Dashboard layouts POST error:', message);
        return NextResponse.json({ error: 'Failed to create layout' }, { status: 500 });
    }
}

// PUT /api/dashboard-layouts — Update an existing layout (verify ownership)
export async function PUT(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const body = await request.json();
        const { id, layout, name } = body;

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const userId = session!.user.id;

        // Verify ownership
        const existing = await prisma.dashboardLayout.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Layout not found' }, { status: 404 });
        }

        const updateData: Record<string, unknown> = {};
        if (layout !== undefined) updateData.layout = JSON.stringify(layout);
        if (name !== undefined) updateData.name = name;

        const updated = await prisma.dashboardLayout.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updated);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Dashboard layouts PUT error:', message);
        return NextResponse.json({ error: 'Failed to update layout' }, { status: 500 });
    }
}
