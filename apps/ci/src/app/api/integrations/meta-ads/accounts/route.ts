import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MetaAdsService } from '@/lib/services/metaAdsService';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    if (!brandId) return NextResponse.json({ error: 'Missing brandId' }, { status: 400 });

    try {
        const rows = await prisma.integration.findMany({
            where: { brandId, provider: 'meta_ads' },
        });
        const pending = rows.find((r: any) => !r.customerId);
        if (!pending?.accessToken) {
            return NextResponse.json({ error: 'No pending Meta Ads integration found' }, { status: 404 });
        }

        const accounts = await MetaAdsService.getAdAccounts(pending.accessToken);
        return NextResponse.json({ accounts });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
