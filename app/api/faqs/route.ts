import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const page = req.nextUrl.searchParams.get('page');
    const locale = req.nextUrl.searchParams.get('locale') || 'en';

    const where: { locale: string; page?: string } = { locale };
    if (page) {
        where.page = page;
    }

    const faqs = await prisma.fAQ.findMany({
        where,
        orderBy: { order: 'asc' },
    });

    return NextResponse.json({ faqs });
}
