import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import '@/lib/services/adapters'; // Register all adapters
import { syncBrand } from '@/lib/services/syncEngine';

// POST /api/sync/[brandId] — Sync all integrations for a specific brand
export async function POST(
    request: Request,
    { params }: { params: Promise<{ brandId: string }> }
) {
    const { error } = await requireAuth();
    if (error) return error;

    try {
        const { brandId } = await params;
        const body = await request.json().catch(() => ({}));
        const days = body.days || 7;

        const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const dateTo = new Date();

        const results = await syncBrand(brandId, dateFrom, dateTo);

        const totalMetrics = results.reduce((s, r) => s + r.metricsWritten, 0);
        const totalErrors = results.reduce((s, r) => s + r.errors.length, 0);

        return NextResponse.json({
            brandId,
            synced: results.length,
            totalMetrics,
            totalErrors,
            results,
        });
    } catch (err: any) {
        console.error('Brand sync error:', err);
        return NextResponse.json({ error: err.message || 'Sync failed' }, { status: 500 });
    }
}
