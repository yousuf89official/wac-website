import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// GET /api/campaign-templates — List templates, optionally filtered by brand
export async function GET(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;

    try {
        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brandId');

        const where = brandId
            ? { OR: [{ brandId }, { isGlobal: true }] }
            : {};

        const templates = await prisma.campaignTemplate.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(templates);
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}

// POST /api/campaign-templates — Create a new template
export async function POST(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const body = await request.json();
        const { name, description, brandId, structure, isGlobal } = body;

        if (!name || !name.trim()) {
            return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
        }

        if (!structure) {
            return NextResponse.json({ error: 'Template structure is required' }, { status: 400 });
        }

        // Validate structure is valid JSON string
        if (typeof structure === 'string') {
            try {
                JSON.parse(structure);
            } catch {
                return NextResponse.json({ error: 'Structure must be a valid JSON string' }, { status: 400 });
            }
        }

        const template = await prisma.campaignTemplate.create({
            data: {
                name: name.trim(),
                description: description || null,
                brandId: brandId || null,
                structure: typeof structure === 'string' ? structure : JSON.stringify(structure),
                isGlobal: isGlobal || false,
                createdBy: session!.user.id,
            },
        });

        await logActivity({
            userId: session?.user?.id,
            userName: session?.user?.name || 'User',
            userEmail: session?.user?.email || '',
            action: 'create',
            target: 'Campaign',
            detail: `Created campaign template "${template.name}"`,
        });

        return NextResponse.json(template, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
