import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import '@/lib/services/adapters'; // Register all adapters
import { syncAll } from '@/lib/services/syncEngine';

// POST /api/sync — Sync all active integrations across all brands (admin only)
export async function POST(request: Request) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const body = await request.json().catch(() => ({}));
        const days = body.days || 7;

        const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const dateTo = new Date();

        const results = await syncAll(dateFrom, dateTo);

        const totalMetrics = results.reduce((s, r) => s + r.metricsWritten, 0);
        const totalErrors = results.reduce((s, r) => s + r.errors.length, 0);

        return NextResponse.json({
            synced: results.length,
            totalMetrics,
            totalErrors,
            results,
        });
    } catch (err: any) {
        console.error('Sync all error:', err);
        return NextResponse.json({ error: err.message || 'Sync failed' }, { status: 500 });
    }
}
