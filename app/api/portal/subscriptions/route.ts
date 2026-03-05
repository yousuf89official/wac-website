import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/auth-customer';

export async function GET() {
    const auth = await requireCustomer();
    if (auth instanceof NextResponse) return auth;

    const subscriptions = await prisma.subscription.findMany({
        where: { customerId: auth.customerId },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ subscriptions });
}
