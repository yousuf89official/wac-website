import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySignature } from '@/lib/midtrans';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            order_id: orderId,
            status_code: statusCode,
            gross_amount: grossAmount,
            signature_key: signatureKey,
            transaction_status: transactionStatus,
            payment_type: paymentType,
            transaction_id: transactionId,
            transaction_time: transactionTime,
            settlement_time: settlementTime,
            fraud_status: fraudStatus,
        } = body;

        // Verify signature
        if (!verifySignature(orderId, statusCode, grossAmount, signatureKey)) {
            console.error('Midtrans webhook: invalid signature for', orderId);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        // Find the order
        const order = await prisma.order.findUnique({
            where: { orderId },
            include: { invoices: true },
        });

        if (!order) {
            console.error('Midtrans webhook: order not found', orderId);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Idempotency: skip if already settled
        if (order.status === 'settlement' && transactionStatus === 'settlement') {
            return NextResponse.json({ message: 'Already processed' });
        }

        // Map Midtrans status to our status
        let newStatus = order.status;
        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'accept' || !fraudStatus) {
                newStatus = 'settlement';
            } else {
                newStatus = 'deny';
            }
        } else if (transactionStatus === 'pending') {
            newStatus = 'pending';
        } else if (transactionStatus === 'deny') {
            newStatus = 'deny';
        } else if (transactionStatus === 'expire') {
            newStatus = 'expire';
        } else if (transactionStatus === 'cancel') {
            newStatus = 'cancel';
        } else if (transactionStatus === 'refund' || transactionStatus === 'partial_refund') {
            newStatus = 'refund';
        }

        // Update order
        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: newStatus,
                transactionId,
                paymentMethod: paymentType,
            },
        });

        // Create payment record
        await prisma.payment.create({
            data: {
                orderId: order.id,
                transactionId,
                amount: parseFloat(grossAmount),
                paymentType: paymentType || 'unknown',
                status: transactionStatus,
                transactionTime: transactionTime ? new Date(transactionTime) : null,
                settlementTime: settlementTime ? new Date(settlementTime) : null,
            },
        });

        // On successful payment: create enrollment + invoice
        if (newStatus === 'settlement') {
            // Create enrollment if course order
            if (order.courseId) {
                await prisma.enrollment.upsert({
                    where: {
                        customerId_courseId: {
                            customerId: order.customerId,
                            courseId: order.courseId,
                        },
                    },
                    create: {
                        customerId: order.customerId,
                        courseId: order.courseId,
                        progress: 0,
                    },
                    update: {},
                });
            }

            // Create invoice if none exists
            if (order.invoices.length === 0) {
                const invoiceCount = await prisma.invoice.count();
                const invoiceNumber = `INV-WAC-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

                await prisma.invoice.create({
                    data: {
                        invoiceNumber,
                        orderId: order.id,
                        customerId: order.customerId,
                        amount: order.amount,
                        currency: order.currency,
                        status: 'paid',
                        paidAt: new Date(),
                    },
                });
            }
        }

        return NextResponse.json({ message: 'OK' });
    } catch (error) {
        console.error('Midtrans webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
