"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, Link } from '@/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import NeonButton from '@/components/ui/NeonButton';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    price: number;
    image: string | null;
    category: string;
}

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations('checkout');
    const courseId = searchParams.get('courseId');

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!courseId) {
            router.push('/academy');
            return;
        }

        // Fetch course details
        fetch(`/api/courses/${courseId}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.course) {
                    setCourse(data.course);
                } else {
                    router.push('/academy');
                }
            })
            .catch(() => router.push('/academy'))
            .finally(() => setLoading(false));

        // Pre-fill from customer data
        fetch('/api/customer/me')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.customer) {
                    setForm(prev => ({
                        ...prev,
                        customerName: `${data.customer.firstName} ${data.customer.lastName}`.trim(),
                        customerEmail: data.customer.email,
                        customerPhone: data.customer.phone || '',
                    }));
                }
            })
            .catch(() => {});
    }, [courseId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/payments/create-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: Number(courseId),
                    ...form,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create transaction');
                return;
            }

            // Open Midtrans Snap popup
            if (window.snap) {
                window.snap.pay(data.token, {
                    onSuccess: () => {
                        router.push(`/checkout/finish?orderId=${data.orderId}`);
                    },
                    onPending: () => {
                        router.push(`/checkout/pending?orderId=${data.orderId}`);
                    },
                    onError: () => {
                        router.push(`/checkout/error?orderId=${data.orderId}`);
                    },
                    onClose: () => {
                        // User closed the popup without completing payment
                    },
                });
            } else {
                // Fallback: redirect to Midtrans payment page
                window.location.href = data.redirectUrl;
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-lg mx-auto">
                <Link href="/academy" className="inline-flex items-center gap-2 text-gray-500 text-sm hover:text-white transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" /> Back to Academy
                </Link>

                <h1 className="text-2xl font-black text-white tracking-tighter mb-2">{t('title')}</h1>

                {/* Order Summary */}
                {course && (
                    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 mb-6">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                                {course.image ? (
                                    <img src={course.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-semibold">{course.title}</p>
                                <p className="text-gray-500 text-sm">{course.category}</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Total</span>
                            <span className="text-xl font-black text-white">{formatCurrency(course.price)}</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Checkout Form */}
                <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            {t('name')}
                        </label>
                        <input
                            type="text"
                            value={form.customerName}
                            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={form.customerEmail}
                            onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            {t('phone')}
                        </label>
                        <input
                            type="tel"
                            value={form.customerPhone}
                            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors"
                            placeholder="+62..."
                        />
                    </div>

                    <NeonButton
                        variant="primary"
                        type="submit"
                        className="w-full py-3"
                        disabled={submitting}
                    >
                        {submitting ? '...' : t('payNow')}
                    </NeonButton>

                    <div className="flex items-center justify-center gap-2 text-gray-600 text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        Secured by Midtrans
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
