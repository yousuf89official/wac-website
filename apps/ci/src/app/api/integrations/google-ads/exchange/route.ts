import { NextResponse } from 'next/server';
import { GoogleAdsService } from '../../../../../lib/services/googleAdsService';
import { requireAuth } from '@/lib/api-auth';

// POST /api/integrations/google-ads/exchange
export async function POST(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const body = await request.json();
        const { code, brandId } = body;
        await GoogleAdsService.handleCallback(code, brandId);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('Google Ads Exchange Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
