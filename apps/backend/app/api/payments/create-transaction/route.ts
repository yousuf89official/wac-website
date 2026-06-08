import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/auth-customer';
import { createTransactionSchema } from '@/lib/validations';
import { snap, generateOrderId } from '@/lib/midtrans';

export async function POST(req: NextRequest) {
    const auth = await requireCustomer();
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await req.json();
        const parsed = createTransactionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { courseId, customerName, customerEmail, customerPhone } = parsed.data;

        // Get course details
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        if (!course.price || course.price <= 0) {
            return NextResponse.json({ error: 'Course is free — no payment needed' }, { status: 400 });
        }

        // Check if already enrolled
        const existing = await prisma.enrollment.findUnique({
            where: { customerId_courseId: { customerId: auth.customerId, courseId } },
        });
        if (existing) {
            return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 409 });
        }

        const orderId = generateOrderId();

        // Create Order in DB
        const order = await prisma.order.create({
            data: {
                orderId,
                customerId: auth.customerId,
                type: 'course',
                courseId,
                amount: course.price,
                currency: 'IDR',
                customerEmail,
                customerName,
                customerPhone: customerPhone || null,
                status: 'pending',
            },
        });

        // Create Snap transaction
        const [firstName, ...lastParts] = customerName.split(' ');
        const lastName = lastParts.join(' ') || firstName;

        const transaction = await snap.createTransaction({
            transaction_details: {
                order_id: orderId,
                gross_amount: Math.round(course.price),
            },
            customer_details: {
                first_name: firstName,
                last_name: lastName,
                email: customerEmail,
                phone: customerPhone || undefined,
            },
            item_details: [{
                id: `course-${course.id}`,
                price: Math.round(course.price),
                quantity: 1,
                name: course.title.substring(0, 50),
            }],
        });

        // Store snap token
        await prisma.order.update({
            where: { id: order.id },
            data: { snapToken: transaction.token },
        });

        return NextResponse.json({
            token: transaction.token,
            redirectUrl: transaction.redirect_url,
            orderId,
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}
