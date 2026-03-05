"use client";

import { useState } from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import NeonButton from '@/components/ui/NeonButton';

export default function RegisterPage() {
    const router = useRouter();
    const t = useTranslations('auth');
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setLoading(true);

        try {
            const res = await fetch('/api/customer/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.details) {
                    setFieldErrors(data.details);
                } else {
                    setError(data.error || 'Registration failed');
                }
                return;
            }

            router.push('/dashboard');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getFieldError = (field: string) => fieldErrors[field]?.[0];

    return (
        <div className="rounded-[2rem] bg-white/[0.03] border border-white/5 p-8 backdrop-blur-sm">
            <h1 className="text-2xl font-black text-white tracking-tighter mb-2">
                {t('register')}
            </h1>
            <p className="text-gray-500 text-sm mb-8">
                {t('haveAccount')}{' '}
                <Link href="/login" className="text-primary hover:underline">
                    {t('signIn')}
                </Link>
            </p>

            {error && (
                <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            {t('firstName')}
                        </label>
                        <input
                            type="text"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors"
                        />
                        {getFieldError('firstName') && (
                            <p className="text-red-400 text-xs mt-1">{getFieldError('firstName')}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            {t('lastName')}
                        </label>
                        <input
                            type="text"
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors"
                        />
                        {getFieldError('lastName') && (
                            <p className="text-red-400 text-xs mt-1">{getFieldError('lastName')}</p>
                        )}
                    </div>
                </div>

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
                    {getFieldError('email') && (
                        <p className="text-red-400 text-xs mt-1">{getFieldError('email')}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                        {t('password')}
                    </label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                        minLength={8}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors"
                        placeholder="Min. 8 characters"
                    />
                    {getFieldError('password') && (
                        <p className="text-red-400 text-xs mt-1">{getFieldError('password')}</p>
                    )}
                </div>

                <NeonButton
                    variant="primary"
                    type="submit"
                    className="w-full py-3"
                    disabled={loading}
                >
                    {loading ? '...' : t('signUp')}
                </NeonButton>
            </form>
        </div>
    );
}
