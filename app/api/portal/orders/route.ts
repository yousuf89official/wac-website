import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/auth-customer';

export async function GET() {
    const auth = await requireCustomer();
    if (auth instanceof NextResponse) return auth;

    const orders = await prisma.order.findMany({
        where: { customerId: auth.customerId },
        include: {
            course: {
                select: { id: true, title: true, slug: true, image: true },
            },
            invoices: {
                select: {
                    id: true,
                    invoiceNumber: true,
                    amount: true,
                    currency: true,
                    status: true,
                    paidAt: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
}
