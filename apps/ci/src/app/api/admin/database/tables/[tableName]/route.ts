import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tableName: string }> }
) {
    const { error } = await requireAdmin();
    if (error) return error;
    const { tableName } = await params;

    // Strict table name validation — only allow alphanumeric and underscores
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
        return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const q = searchParams.get('q') || '';
    const offset = (page - 1) * limit;

    try {
        // Validate table exists in public schema
        const tablesRaw: any[] = await prisma.$queryRawUnsafe(
            `SELECT table_name FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = $1;`,
            tableName
        );

        if (tablesRaw.length === 0) {
            return NextResponse.json({ error: 'Table not found' }, { status: 404 });
        }

        // Get columns
        const columnsRaw: any[] = await prisma.$queryRawUnsafe(
            `SELECT column_name FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = $1
             ORDER BY ordinal_position;`,
            tableName
        );
        const columns = columnsRaw.map((c: any) => c.column_name);

        let data: any[];
        let total: number;

        if (q && columns.length > 0) {
            const searchConditions = columns.map((col, i) => `"${col}"::text ILIKE $${i + 1}`).join(' OR ');
            const searchValues = columns.map(() => `%${q}%`);

            data = await prisma.$queryRawUnsafe(
                `SELECT * FROM "${tableName}" WHERE ${searchConditions} LIMIT $${columns.length + 1} OFFSET $${columns.length + 2};`,
                ...searchValues,
                limit,
                offset
            );

            const countRaw: any[] = await prisma.$queryRawUnsafe(
                `SELECT COUNT(*) as count FROM "${tableName}" WHERE ${searchConditions};`,
                ...searchValues
            );
            total = Number(countRaw[0].count);
        } else {
            data = await prisma.$queryRawUnsafe(
                `SELECT * FROM "${tableName}" LIMIT $1 OFFSET $2;`,
                limit,
                offset
            );

            const countRaw: any[] = await prisma.$queryRawUnsafe(
                `SELECT COUNT(*) as count FROM "${tableName}";`
            );
            total = Number(countRaw[0].count);
        }

        return NextResponse.json({
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error(`Failed to fetch data for table ${tableName}:`, error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
