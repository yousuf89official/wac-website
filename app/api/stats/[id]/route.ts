import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await req.json();
        const stat = await prisma.stat.update({
            where: { id: parseInt(params.id) },
            data: body
        });
        return NextResponse.json(stat);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating stat' }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await prisma.stat.delete({ where: { id: parseInt(params.id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting stat' }, { status: 500 });
    }
}
