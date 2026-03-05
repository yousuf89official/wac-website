"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { CheckCircle2, BookOpen } from 'lucide-react';
import NeonButton from '@/components/ui/NeonButton';

interface OrderStatus {
    orderId: string;
    status: string;
    course: { title: string; slug: string } | null;
}

function FinishContent() {
    const searchParams = useSearchParams();
    const t = useTranslations('checkout');
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState<OrderStatus | null>(null);

    useEffect(() => {
        if (orderId) {
            fetch(`/api/payments/status?orderId=${orderId}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => setOrder(data))
                .catch(() => {});
        }
    }, [orderId]);

    return (
        <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
            <div className="max-w-md text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tighter mb-2">{t('success')}</h1>
                <p className="text-gray-400 text-sm mb-8">{t('successDesc')}</p>

                {order?.course && (
                    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 mb-6 flex items-center gap-4">
                        <BookOpen className="w-6 h-6 text-primary" />
                        <div className="text-left">
                            <p className="text-white font-semibold text-sm">{order.course.title}</p>
                            <p className="text-gray-500 text-xs">Ready to access</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <Link href="/dashboard/courses">
                        <NeonButton variant="primary" className="w-full py-3">
                            {t('goToDashboard')}
                        </NeonButton>
                    </Link>
                    <Link href="/academy" className="text-gray-500 text-sm hover:text-white transition-colors">
                        Browse more courses
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutFinishPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <FinishContent />
        </Suspense>
    );
}
