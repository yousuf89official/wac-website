import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { customerLoginSchema } from '@/lib/validations';
import { verifyPassword as verifyCustomerPassword, createCustomerToken, setCustomerCookie } from '@/lib/auth-customer';
import { verifyPassword as verifyAdminPassword, createToken as createAdminToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = customerLoginSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { email, password } = parsed.data;

        // 1. Check Customer table first
        const customer = await prisma.customer.findUnique({ where: { email } });
        if (customer) {
            const valid = await verifyCustomerPassword(password, customer.password);
            if (!valid) {
                return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
            }

            const token = await createCustomerToken({
                customerId: customer.id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
            });
            await setCustomerCookie(token);

            return NextResponse.json({
                userType: 'customer',
                user: {
                    id: customer.id,
                    email: customer.email,
                    name: `${customer.firstName} ${customer.lastName}`,
                },
            });
        }

        // 2. Check Admin User table
        const admin = await prisma.user.findUnique({ where: { email } });
        if (admin) {
            const valid = await verifyAdminPassword(password, admin.password);
            if (!valid) {
                return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
            }

            const token = await createAdminToken({
                userId: admin.id,
                email: admin.email,
                role: admin.role,
            });
            await setAuthCookie(token);

            return NextResponse.json({
                userType: 'admin',
                user: {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                },
            });
        }

        // Neither found
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
