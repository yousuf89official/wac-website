
'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function saveInvoice(invoiceData: any) {
    const session = { user: await getCurrentUser() };
    if (!session.user?.id) {
        throw new Error("Unauthorized");
    }

    // Ensure paymentDetails and signature are objects before JSON stringifying if they aren't already string
    // But coming from JSON state, they are objects.

    // Prepare data directly from the state structure
    const data = {
        invoiceNumber: invoiceData.invoiceNumber,
        date: new Date(invoiceData.date),
        dueDate: new Date(invoiceData.dueDate),
        sellerName: invoiceData.seller.name,
        sellerEmail: invoiceData.seller.email,
        sellerAddress: invoiceData.seller.address,
        sellerPhone: invoiceData.seller.phone,
        buyerName: invoiceData.buyer.name,
        buyerEmail: invoiceData.buyer.email,
        buyerAddress: invoiceData.buyer.address,
        buyerPhone: invoiceData.buyer.phone,
        items: JSON.stringify(invoiceData.items),
        taxRate: parseFloat(invoiceData.taxRate),
        currencySymbol: invoiceData.currencySymbol,
        paymentDetails: JSON.stringify(invoiceData.paymentDetails),
        terms: invoiceData.terms,
        signatureImage: invoiceData.signature?.image || null,
        signerName: invoiceData.signature?.signerName || null,
        signatureMeta: JSON.stringify({
            position: invoiceData.signature?.position || { x: 0, y: 0 },
            title: invoiceData.signature?.title || 'Director'
        }),
        status: 'Saved',
        userId: session.user.id
    };

    let savedInvoice;
    if (invoiceData.id) {
        // Update
        savedInvoice = await prisma.invoice.update({
            where: { id: invoiceData.id },
            data: data
        });
    } else {
        // Create
        savedInvoice = await prisma.invoice.create({
            data: data
        });
    }

    revalidatePath('/tools/invoice');
    return savedInvoice;
}

export async function getInvoices() {
    const session = { user: await getCurrentUser() };
    if (!session.user?.id) {
        return [];
    }

    const invoices = await prisma.invoice.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    return invoices;
}

export async function deleteInvoice(id: string) {
    const session = { user: await getCurrentUser() };
    if (!session.user?.id) {
        throw new Error("Unauthorized");
    }

    await prisma.invoice.delete({
        where: { id: id }
    });

    revalidatePath('/tools/invoice');
}
