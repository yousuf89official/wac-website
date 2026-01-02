import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await req.json();
        const client = await prisma.client.update({
            where: { id: parseInt(params.id) },
            data: body
        });
        return NextResponse.json(client);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating client' }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await prisma.client.delete({ where: { id: parseInt(params.id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting client' }, { status: 500 });
    }
}
