import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { customerRegisterSchema } from '@/lib/validations';
import { hashPassword, createCustomerToken, setCustomerCookie } from '@/lib/auth-customer';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = customerRegisterSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { email, password, firstName, lastName, phone, company, country } = parsed.data;

        // Check if customer already exists
        const existing = await prisma.customer.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Create customer
        const hashedPassword = await hashPassword(password);
        const customer = await prisma.customer.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone: phone || null,
                company: company || null,
                country: country || 'ID',
            },
        });

        // Create token and set cookie
        const token = await createCustomerToken({
            customerId: customer.id,
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
        });
        await setCustomerCookie(token);

        return NextResponse.json({
            customer: {
                id: customer.id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Customer registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
