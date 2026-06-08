import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// POST /api/integrations/manual/connect
export async function POST(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const body = await request.json();
        const { brandId, provider, accountName, customerId } = body;

        if (!brandId || !provider || !accountName || !customerId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create a new integration record
        const integration = await prisma.integration.create({
            data: {
                brandId,
                provider,
                accountName,
                customerId,
                status: 'Active'
            }
        });

        return NextResponse.json(integration);
    } catch (error: any) {
        console.error('[Integrations] Manual connect error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
