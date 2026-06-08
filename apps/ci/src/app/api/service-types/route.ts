import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
    try {
        await requireAuth();
        return NextResponse.json([
            { id: 'st_managed', name: 'Managed Service', slug: 'managed-service' },
            { id: 'st_self', name: 'Self Service', slug: 'self-service' },
        ]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch service types' }, { status: error.message === 'Unauthorized' ? 401 : 500 });
    }
}
