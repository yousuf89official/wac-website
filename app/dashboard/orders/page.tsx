"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, FileText } from 'lucide-react';

interface OrderInvoice {
    id: number;
    invoiceNumber: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: string | null;
}

interface Order {
    id: number;
    orderId: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string | null;
    createdAt: string;
    course: {
        id: number;
        title: string;
        slug: string;
        image: string | null;
    } | null;
    invoices: OrderInvoice[];
}

const statusTone: Record<string, string> = {
    pending: 'border-foreground/15 text-foreground-soft',
    settlement: 'border-primary/30 text-primary',
    expire: 'border-foreground/10 text-foreground-soft',
    cancel: 'border-destructive/30 text-destructive',
    deny: 'border-destructive/30 text-destructive',
    refund: 'border-foreground/15 text-foreground-soft',
};

const ease = [0.16, 1, 0.3, 1] as const;

function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/portal/orders')
            .then(res => res.json())
            .then(data => setOrders(data.orders || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            pending: "Pending",
            settlement: "Paid",
            expire: "Expired",
            cancel: "Cancelled",
            deny: "Denied",
            refund: "Refunded",
        };
        return map[status] || status;
    };

    return (
        <div className="space-y-12">
            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease }}
            >
                <p className="eyebrow mb-3">PORTAL / ORDERS</p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">Order history</h1>
                <p className="font-serif text-foreground-soft mt-3 text-lg max-w-2xl">
                    Every purchase, ledgered cleanly. Tap a row to inspect the invoices that follow.
                </p>
            </motion.header>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : orders.length === 0 ? (
                <div className="border border-foreground/10 p-12 text-center">
                    <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-4">No orders yet</p>
                    <p className="font-serif text-foreground-soft">Nothing has crossed the till. Your first purchase will show up here.</p>
                </div>
            ) : (
                <motion.ul
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.7, ease }}
                    className="divide-y divide-foreground/10 border-y border-foreground/10"
                >
                    {orders.map((order, i) => (
                        <motion.li
                            key={order.id}
                            initial={{ opacity: 0, x: -8 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.6, ease, delay: i * 0.04 }}
                        >
                            <button
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                className="w-full grid grid-cols-12 items-baseline gap-x-6 gap-y-2 py-6 text-left transition-colors hover:bg-foreground/[0.03] md:py-8"
                            >
                                <span className="col-span-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft md:col-span-1">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <div className="col-span-10 md:col-span-6">
                                    <h3 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
                                        {order.course?.title || order.orderId}
                                    </h3>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                        <span>{order.orderId}</span>
                                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                        {order.paymentMethod && <span>{order.paymentMethod}</span>}
                                    </div>
                                </div>
                                <div className="col-span-8 md:col-span-3 md:text-right">
                                    <span className={`inline-flex border px-2.5 py-1 font-mono text-2xs uppercase tracking-widest ${statusTone[order.status] || 'border-foreground/15 text-foreground-soft'}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                                <div className="col-span-4 md:col-span-2 text-right">
                                    <p className="font-display text-xl font-medium tracking-tight">
                                        {formatCurrency(order.amount, order.currency)}
                                    </p>
                                    <ChevronRight
                                        className={`mt-1 inline w-4 h-4 text-foreground-soft transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`}
                                        strokeWidth={1.25}
                                    />
                                </div>
                            </button>

                            {expandedOrder === order.id && order.invoices.length > 0 && (
                                <div className="border-t border-foreground/10 px-0 py-6 bg-foreground/[0.02]">
                                    <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-4">Invoices</p>
                                    <div className="divide-y divide-foreground/10">
                                        {order.invoices.map((invoice) => (
                                            <div key={invoice.id} className="flex items-center justify-between py-3">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-4 h-4 text-foreground-soft" strokeWidth={1.25} />
                                                    <div>
                                                        <p className="font-serif text-base">{invoice.invoiceNumber}</p>
                                                        <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                            {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : "Pending"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-display text-lg font-medium tracking-tight">
                                                        {formatCurrency(invoice.amount, invoice.currency)}
                                                    </p>
                                                    <span className={`font-mono text-2xs uppercase tracking-widest ${invoice.status === 'paid' ? 'text-primary' : 'text-foreground-soft'}`}>
                                                        {invoice.status === 'paid' ? "Paid" : "Pending"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.li>
                    ))}
                </motion.ul>
            )}
        </div>
    );
}
