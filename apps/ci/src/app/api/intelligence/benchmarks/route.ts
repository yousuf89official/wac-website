import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { generateBenchmarks } from '@/lib/intelligence';

// GET /api/intelligence/benchmarks?brandId=X
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

        const report = await generateBenchmarks(brandId, days);
        return NextResponse.json(report);
    } catch (err: any) {
        console.error('Benchmark error:', err);
        return NextResponse.json({ error: err.message || 'Failed to generate benchmarks' }, { status: 500 });
    }
}
