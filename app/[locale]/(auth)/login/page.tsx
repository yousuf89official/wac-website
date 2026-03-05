"use client";

import { useState } from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import NeonButton from '@/components/ui/NeonButton';

export default function LoginPage() {
    const router = useRouter();
    const t = useTranslations('auth');
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/customer/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login failed');
                return;
            }

            // Redirect based on user type
            if (data.userType === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-[2rem] bg-white/[0.03] border border-white/5 p-8 backdrop-blur-sm">
            <h1 className="text-2xl font-black text-white tracking-tighter mb-2">
                {t('signIn')}
            </h1>
            <p className="text-gray-500 text-sm mb-8">
                {t('noAccount')}{' '}
                <Link href="/register" className="text-primary hover:underline">
                    {t('signUp')}
                </Link>
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
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                            {t('password')}
                        </label>
                        <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                            {t('forgotPassword')}
                        </Link>
                    </div>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors"
                        placeholder="••••••••"
                    />
                </div>

                <NeonButton
                    variant="primary"
                    type="submit"
                    className="w-full py-3"
                    disabled={loading}
                >
                    {loading ? '...' : t('signIn')}
                </NeonButton>
            </form>
        </div>
    );
}
