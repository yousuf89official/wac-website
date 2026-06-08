import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;
    try {
        const tables: any[] = await prisma.$queryRawUnsafe(
            `SELECT table_name AS name FROM information_schema.tables
             WHERE table_schema = 'public'
             AND table_type = 'BASE TABLE'
             AND table_name NOT LIKE '_prisma_%'
             ORDER BY table_name;`
        );
        return NextResponse.json(tables.map((t: any) => t.name));
    } catch (error) {
        console.error('Failed to fetch tables:', error);
        return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
    }
}
