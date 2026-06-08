import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;
    try {
        // 1. Get all tables
        const tablesRaw: any[] = await prisma.$queryRawUnsafe(
            `SELECT table_name AS name FROM information_schema.tables
             WHERE table_schema = 'public'
             AND table_type = 'BASE TABLE'
             AND table_name NOT LIKE '_prisma_%'
             ORDER BY table_name;`
        );
        const tableNames = tablesRaw.map((t: any) => t.name);

        const schema: any = {};

        for (const tableName of tableNames) {
            // 2. Get columns
            const columns: any[] = await prisma.$queryRawUnsafe(
                `SELECT c.column_name, c.data_type, c.is_nullable, c.column_default,
                        CASE WHEN pk.pk_column IS NOT NULL THEN true ELSE false END AS is_pk
                 FROM information_schema.columns c
                 LEFT JOIN (
                     SELECT kcu.column_name AS pk_column
                     FROM information_schema.table_constraints tc
                     JOIN information_schema.key_column_usage kcu
                       ON tc.constraint_name = kcu.constraint_name
                       AND tc.table_schema = kcu.table_schema
                     WHERE tc.table_name = $1 AND tc.table_schema = 'public' AND tc.constraint_type = 'PRIMARY KEY'
                 ) pk ON pk.pk_column = c.column_name
                 WHERE c.table_schema = 'public' AND c.table_name = $1
                 ORDER BY c.ordinal_position;`,
                tableName
            );

            // 3. Get foreign keys
            const foreignKeys: any[] = await prisma.$queryRawUnsafe(
                `SELECT kcu.column_name AS from_column,
                        ccu.table_name AS to_table,
                        ccu.column_name AS to_column
                 FROM information_schema.table_constraints tc
                 JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
                 JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                 WHERE tc.table_name = $1 AND tc.constraint_type = 'FOREIGN KEY';`,
                tableName
            );

            schema[tableName] = {
                columns: columns.map((c: any) => ({
                    name: c.column_name,
                    type: c.data_type,
                    notnull: c.is_nullable === 'NO',
                    pk: c.is_pk,
                    default: c.column_default
                })),
                relations: foreignKeys.map((fk: any) => ({
                    toTable: fk.to_table,
                    fromColumn: fk.from_column,
                    toColumn: fk.to_column
                }))
            };
        }

        return NextResponse.json(schema);
    } catch (error) {
        console.error('Failed to fetch schema:', error);
        return NextResponse.json({ error: 'Failed to fetch schema' }, { status: 500 });
    }
}
