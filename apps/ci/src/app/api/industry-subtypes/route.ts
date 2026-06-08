import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    const { searchParams } = new URL(request.url);
    const industryTypeId = searchParams.get('industryTypeId');

    // Mock logic
    if (industryTypeId === '1') {
        return NextResponse.json([{ id: '11', industryTypeId: '1', name: 'SaaS', slug: 'saas' }]);
    }
    return NextResponse.json([]);
}
