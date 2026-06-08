import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/auth-customer';

export async function GET(req: NextRequest) {
    const auth = await requireCustomer();
    if (auth instanceof NextResponse) return auth;

    const orderId = req.nextUrl.searchParams.get('orderId');
    if (!orderId) {
        return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
        where: { orderId },
        include: {
            course: {
                select: { id: true, title: true, slug: true },
            },
            invoices: {
                select: { invoiceNumber: true, status: true, paidAt: true },
            },
        },
    });

    if (!order || order.customerId !== auth.customerId) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
        orderId: order.orderId,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        course: order.course,
        invoices: order.invoices,
    });
}
