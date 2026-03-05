"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import NeonButton from '@/components/ui/NeonButton';

export default function ForgotPasswordPage() {
    const t = useTranslations('auth');
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/customer/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong');
                return;
            }

            setSent(true);
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="rounded-[2rem] bg-white/[0.03] border border-white/5 p-8 backdrop-blur-sm text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-xl font-black text-white tracking-tighter mb-2">Check Your Email</h2>
                <p className="text-gray-400 text-sm mb-6">
                    If an account exists with <span className="text-white">{email}</span>, we&apos;ve sent a password reset link.
                </p>
                <Link href="/login" className="text-primary text-sm hover:underline">
                    {t('signIn')}
                </Link>
            </div>
        );
    }

    return (
        <div className="rounded-[2rem] bg-white/[0.03] border border-white/5 p-8 backdrop-blur-sm">
            <h1 className="text-2xl font-black text-white tracking-tighter mb-2">
                {t('resetPassword')}
            </h1>
            <p className="text-gray-500 text-sm mb-8">
                Enter your email and we&apos;ll send you a reset link.
            </p>

            {error && (
                <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                        {t('email')}
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors"
                        placeholder="you@example.com"
                    />
                </div>

                <NeonButton
                    variant="primary"
                    type="submit"
                    className="w-full py-3"
                    disabled={loading}
                >
                    {loading ? '...' : t('resetPassword')}
                </NeonButton>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
                <Link href="/login" className="text-primary hover:underline">
                    {t('signIn')}
                </Link>
            </p>
        </div>
    );
}
