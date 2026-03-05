import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/auth-customer';

export async function GET() {
    const auth = await requireCustomer();
    if (auth instanceof NextResponse) return auth;

    const enrollments = await prisma.enrollment.findMany({
        where: { customerId: auth.customerId },
        include: {
            course: {
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    image: true,
                    category: true,
                    duration: true,
                    level: true,
                    modules: true,
                },
            },
        },
        orderBy: { enrolledAt: 'desc' },
    });

    return NextResponse.json({ enrollments });
}
