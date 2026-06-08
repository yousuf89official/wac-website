import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function POST(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const { brandId, customerId, accountName } = await request.json();

        const rows = await prisma.integration.findMany({
            where: { brandId, provider: 'tiktok_ads' },
        });
        if (rows.length === 0) throw new Error('Integration not found');

        const target = rows.find((r: any) => !r.customerId);
        if (!target) throw new Error('No pending integration setup found. Please reconnect.');

        await prisma.integration.update({
            where: { id: target.id },
            data: { customerId, accountName: accountName || null, status: 'active' },
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
