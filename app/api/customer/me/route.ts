import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/auth-customer';
import { customerUpdateSchema, changePasswordSchema } from '@/lib/validations';
import { hashPassword, verifyPassword } from '@/lib/auth-customer';

export async function GET() {
    const auth = await requireCustomer();
    if (auth instanceof NextResponse) return auth;

    const customer = await prisma.customer.findUnique({
        where: { id: auth.customerId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
            company: true,
            country: true,
            createdAt: true,
            _count: {
                select: {
                    enrollments: true,
                    orders: true,
                    savedResources: true,
                },
            },
        },
    });

    if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ customer });
}

export async function PUT(req: NextRequest) {
    const auth = await requireCustomer();
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();

    // Check if this is a password change
    if (body.currentPassword && body.newPassword) {
        const parsed = changePasswordSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const customer = await prisma.customer.findUnique({ where: { id: auth.customerId } });
        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        const valid = await verifyPassword(parsed.data.currentPassword, customer.password);
        if (!valid) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
        }

        const hashed = await hashPassword(parsed.data.newPassword);
        await prisma.customer.update({
            where: { id: auth.customerId },
            data: { password: hashed },
        });

        return NextResponse.json({ success: true, message: 'Password updated' });
    }

    // Profile update
    const parsed = customerUpdateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const updated = await prisma.customer.update({
        where: { id: auth.customerId },
        data: parsed.data,
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
            company: true,
            country: true,
        },
    });

    return NextResponse.json({ customer: updated });
}
