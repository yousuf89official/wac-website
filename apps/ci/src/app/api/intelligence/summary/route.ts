import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { generateBrandSummary } from '@/lib/intelligence';

// GET /api/intelligence/summary?brandId=X
export async function GET(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;

    try {
        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brandId');
        const days = parseInt(searchParams.get('days') || '30');

        if (!brandId) {
            return NextResponse.json({ error: 'brandId required' }, { status: 400 });
        }

        const summary = await generateBrandSummary(brandId, days);
        return NextResponse.json(summary);
    } catch (err: any) {
        console.error('Summary error:', err);
        return NextResponse.json({ error: err.message || 'Failed to generate summary' }, { status: 500 });
    }
}
