import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await req.json();
        const navLink = await prisma.navLink.update({
            where: { id: parseInt(params.id) },
            data: body
        });
        return NextResponse.json(navLink);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating navigation link' }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await prisma.navLink.delete({ where: { id: parseInt(params.id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting navigation link' }, { status: 500 });
    }
}
