import { NextResponse } from 'next/server';
import { TiktokAdsService } from '@/lib/services/tiktokAdsService';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    if (!brandId) return NextResponse.json({ error: 'Missing brandId' }, { status: 400 });

    try {
        const url = TiktokAdsService.getAuthUrl(brandId);
        return NextResponse.json({ url });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
