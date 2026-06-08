import { NextResponse } from 'next/server';
import { MetaAdsService } from '@/lib/services/metaAdsService';
import { requireAuth } from '@/lib/api-auth';

export async function POST(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const { code, brandId } = await request.json();
        await MetaAdsService.handleCallback(code, brandId);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('Meta Ads Exchange Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
