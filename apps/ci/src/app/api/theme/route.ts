import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// GET /api/theme
export async function GET() {
    try {
        const result = await prisma.appConfig.findUnique({
            where: { key: 'theme:default-theme' },
        });

        // No custom theme configured — return empty overrides (200), not 404.
        // The theme is an optional layer on top of the CSS defaults; an absent
        // row means "use defaults", which the client applies as a no-op.
        if (!result) {
            return NextResponse.json({});
        }

        let colors: any = result.value;
        try { colors = JSON.parse(colors); } catch { }

        return NextResponse.json(colors);
    } catch (error: any) {
        console.error('Theme API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
}

// PUT /api/theme
export async function PUT(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const colors = await request.json();
        const value = JSON.stringify(colors);

        await prisma.appConfig.upsert({
            where: { key: 'theme:default-theme' },
            update: { value },
            create: { key: 'theme:default-theme', value },
        });

        return NextResponse.json(colors);
    } catch (error: any) {
        console.error('Theme API PUT Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
}
