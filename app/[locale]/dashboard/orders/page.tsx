"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingBag, FileText, ChevronRight } from 'lucide-react';

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

const statusColors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-500/10',
    settlement: 'text-green-400 bg-green-500/10',
    expire: 'text-gray-400 bg-gray-500/10',
    cancel: 'text-red-400 bg-red-500/10',
    deny: 'text-red-400 bg-red-500/10',
    refund: 'text-blue-400 bg-blue-500/10',
};

function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function OrdersPage() {
    const t = useTranslations('dashboard');
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
            pending: t('pending'),
            settlement: t('settlement'),
            expire: t('expired'),
            cancel: t('cancelled'),
            deny: t('denied'),
            refund: t('refunded'),
        };
        return map[status] || status;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-white tracking-tighter">{t('orders')}</h1>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : orders.length === 0 ? (
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-12 text-center">
                    <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">{t('noOrders')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <div key={order.id} className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
                            <button
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                className="w-full p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5 text-gray-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-white text-sm font-semibold truncate">
                                            {order.course?.title || order.orderId}
                                        </p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status] || 'text-gray-400 bg-gray-500/10'}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-gray-500">{order.orderId}</span>
                                        <span className="text-xs text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-white text-sm font-bold">{formatCurrency(order.amount, order.currency)}</p>
                                    {order.paymentMethod && (
                                        <p className="text-gray-600 text-xs mt-0.5">{order.paymentMethod}</p>
                                    )}
                                </div>
                                <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`} />
                            </button>

                            {expandedOrder === order.id && order.invoices.length > 0 && (
                                <div className="border-t border-white/5 px-5 py-4 bg-white/[0.01]">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">{t('invoices')}</p>
                                    <div className="space-y-2">
                                        {order.invoices.map((invoice) => (
                                            <div key={invoice.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02]">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-4 h-4 text-gray-500" />
                                                    <div>
                                                        <p className="text-white text-sm">{invoice.invoiceNumber}</p>
                                                        <p className="text-gray-600 text-xs">
                                                            {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : t('pending')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-white text-sm font-medium">{formatCurrency(invoice.amount, invoice.currency)}</p>
                                                    <span className={`text-xs ${invoice.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                        {invoice.status === 'paid' ? t('settlement') : t('pending')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
