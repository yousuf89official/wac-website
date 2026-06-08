import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { leadCreateSchema } from '@/lib/validations';

// GET leads is admin-only (protected by middleware + requireAuth)
export async function GET() {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    try {
        const leads = await prisma.lead.findMany({
            orderBy: { created_at: 'desc' },
        });
        return NextResponse.json(leads);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST leads is public (contact form + newsletter popup)
export async function POST(req: Request) {
    try {
        const raw = await req.json();
        const parsed = leadCreateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const lead = await prisma.lead.create({
            data: {
                ...parsed.data,
                status: 'new'
            }
        });
        return NextResponse.json(lead);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
