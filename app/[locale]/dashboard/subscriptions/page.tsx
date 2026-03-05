"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard } from 'lucide-react';

interface Subscription {
    id: number;
    planName: string;
    amount: number;
    currency: string;
    status: string;
    billingCycle: string;
    nextBillingDate: string | null;
    createdAt: string;
}

const statusColors: Record<string, string> = {
    active: 'text-green-400 bg-green-500/10',
    paused: 'text-yellow-400 bg-yellow-500/10',
    cancelled: 'text-red-400 bg-red-500/10',
};

function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function SubscriptionsPage() {
    const t = useTranslations('dashboard');
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/portal/subscriptions')
            .then(res => res.json())
            .then(data => setSubscriptions(data.subscriptions || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const getCycleLabel = (cycle: string) => {
        const map: Record<string, string> = {
            monthly: t('monthly'),
            quarterly: t('quarterly'),
            yearly: t('yearly'),
        };
        return map[cycle] || cycle;
    };

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            active: t('active'),
            paused: t('paused'),
            cancelled: t('cancelled'),
        };
        return map[status] || status;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-white tracking-tighter">{t('subscriptions')}</h1>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : subscriptions.length === 0 ? (
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-12 text-center">
                    <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">{t('noSubscriptions')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {subscriptions.map((sub) => (
                        <div key={sub.id} className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-black" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold">{sub.planName}</h3>
                                        <p className="text-gray-500 text-xs">{getCycleLabel(sub.billingCycle)}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full ${statusColors[sub.status] || 'text-gray-400 bg-gray-500/10'}`}>
                                    {getStatusLabel(sub.status)}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">{t('amount')}</p>
                                    <p className="text-white font-bold">{formatCurrency(sub.amount, sub.currency)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">{t('nextBilling')}</p>
                                    <p className="text-white">
                                        {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
