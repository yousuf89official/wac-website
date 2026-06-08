import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { scoreBrand, scoreCampaign } from '@/lib/intelligence';

// GET /api/intelligence/score?brandId=X or ?campaignId=X
export async function GET(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;

    try {
        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brandId');
        const campaignId = searchParams.get('campaignId');
        const days = parseInt(searchParams.get('days') || '30');

        if (campaignId) {
            const score = await scoreCampaign(campaignId, days);
            return NextResponse.json(score);
        }

        if (brandId) {
            const scores = await scoreBrand(brandId, days);
            return NextResponse.json(scores);
        }

        return NextResponse.json({ error: 'brandId or campaignId required' }, { status: 400 });
    } catch (err: any) {
        console.error('Score error:', err);
        return NextResponse.json({ error: err.message || 'Failed to score' }, { status: 500 });
    }
}
