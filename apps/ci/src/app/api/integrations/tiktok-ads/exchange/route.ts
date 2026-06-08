import { NextResponse } from 'next/server';
import { TiktokAdsService } from '@/lib/services/tiktokAdsService';
import { requireAuth } from '@/lib/api-auth';

export async function POST(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const { code, brandId } = await request.json();
        await TiktokAdsService.handleCallback(code, brandId);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('TikTok Ads Exchange Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
