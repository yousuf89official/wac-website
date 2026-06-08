"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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

const statusTone: Record<string, string> = {
    active: 'border-primary/30 text-primary',
    paused: 'border-foreground/15 text-foreground-soft',
    cancelled: 'border-destructive/30 text-destructive',
};

const ease = [0.16, 1, 0.3, 1] as const;

function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function SubscriptionsPage() {
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
            monthly: "Monthly",
            quarterly: "Quarterly",
            yearly: "Yearly",
        };
        return map[cycle] || cycle;
    };

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            active: "Active",
            paused: "Paused",
            cancelled: "Cancelled",
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
                <p className="eyebrow mb-3">PORTAL / SUBSCRIPTIONS</p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">Recurring plans</h1>
                <p className="font-serif text-foreground-soft mt-3 text-lg max-w-2xl">
                    The plans that keep the lights on. Cycles, amounts, and the next billing date in one quiet ledger.
                </p>
            </motion.header>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : subscriptions.length === 0 ? (
                <div className="border border-foreground/10 p-12 text-center">
                    <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-4">No subscriptions</p>
                    <p className="font-serif text-foreground-soft">No recurring plans active. When one starts, it will appear here.</p>
                </div>
            ) : (
                <motion.ul
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.7, ease }}
                    className="divide-y divide-foreground/10 border-y border-foreground/10"
                >
                    {subscriptions.map((sub, i) => (
                        <motion.li
                            key={sub.id}
                            initial={{ opacity: 0, x: -8 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.6, ease, delay: i * 0.04 }}
                            className="grid grid-cols-12 items-baseline gap-x-6 gap-y-3 py-6 md:py-8"
                        >
                            <span className="col-span-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft md:col-span-1">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <div className="col-span-10 md:col-span-5">
                                <h3 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
                                    {sub.planName}
                                </h3>
                                <p className="mt-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                    {getCycleLabel(sub.billingCycle)}
                                </p>
                            </div>
                            <div className="col-span-6 md:col-span-2">
                                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-1">Amount</p>
                                <p className="font-display text-xl font-medium tracking-tight">{formatCurrency(sub.amount, sub.currency)}</p>
                            </div>
                            <div className="col-span-6 md:col-span-2">
                                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-1">Next billing</p>
                                <p className="font-serif text-base">
                                    {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : '—'}
                                </p>
                            </div>
                            <div className="col-span-12 md:col-span-2 md:text-right">
                                <span className={`inline-flex border px-2.5 py-1 font-mono text-2xs uppercase tracking-widest ${statusTone[sub.status] || 'border-foreground/15 text-foreground-soft'}`}>
                                    {getStatusLabel(sub.status)}
                                </span>
                            </div>
                        </motion.li>
                    ))}
                </motion.ul>
            )}
        </div>
    );
}
