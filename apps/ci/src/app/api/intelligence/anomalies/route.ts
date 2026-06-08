import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { detectAnomalies } from '@/lib/intelligence';

// GET /api/intelligence/anomalies?brandId=X
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

        const anomalies = await detectAnomalies(brandId, days);

        return NextResponse.json({
            brandId,
            period: `${days} days`,
            total: anomalies.length,
            critical: anomalies.filter(a => a.severity === 'critical').length,
            warnings: anomalies.filter(a => a.severity === 'warning').length,
            anomalies,
        });
    } catch (err: any) {
        console.error('Anomaly detection error:', err);
        return NextResponse.json({ error: err.message || 'Failed to detect anomalies' }, { status: 500 });
    }
}
