import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// GET /api/sub-campaigns/:id
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const params = await props.params;
        const { id } = params;
        const sub = await prisma.subCampaign.findUnique({ where: { id } });
        if (!sub) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
        return NextResponse.json(sub);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT /api/sub-campaigns/:id
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const params = await props.params;
        const { id } = params;
        const body = await request.json();

        const updated = await prisma.subCampaign.update({
            where: { id },
            data: {
                name: body.name,
                slug: body.slug,
                description: body.description,
                status: body.status,
                startDate: body.startDate ? new Date(body.startDate) : null,
                endDate: body.endDate ? new Date(body.endDate) : null,
                budgetPlanned: parseFloat(body.budgetPlanned || 0),
                targetAudience: body.targetAudience ? JSON.stringify(body.targetAudience) : null,
                configuration: body.configuration ? JSON.stringify(body.configuration) : null,
            }
        });
        return NextResponse.json({ success: true, ...updated });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
