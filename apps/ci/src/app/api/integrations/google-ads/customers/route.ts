import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleAdsService } from '../../../../../lib/services/googleAdsService';
import { requireAuth } from '@/lib/api-auth';

// GET /api/integrations/google-ads/customers
export async function GET(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    if (!brandId) return NextResponse.json({ error: 'Missing brandId' }, { status: 400 });

    try {
        const rows = await prisma.integration.findMany({
            where: { brandId, provider: 'google_ads' }
        });
        if (rows.length === 0) throw new Error('Integration not found');

        // Prefer the one without customerId (pending), else use any connected one
        const integration = rows.find((r: any) => !r.customerId) || rows[0];
        const refreshToken = integration.refreshToken;
        if (!refreshToken) throw new Error('No refresh token found');

        const customers = await GoogleAdsService.getAccessibleCustomers(refreshToken);
        return NextResponse.json({ customers });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
