"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

export default function RegisterPage() {
    const router = useRouter();
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
        <div className="mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 gap-x-6 px-6 pt-28 pb-16 md:grid-cols-12 md:px-12 md:pt-32 lg:px-20">
            {/* Editorial side */}
            <div className="md:col-span-7 md:pr-12 lg:pr-20">
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease, delay: 0.05 }}
                    className="eyebrow mb-10 flex items-center gap-3"
                >
                    <span className="inline-block h-px w-10 bg-foreground-soft" />
                    <span>Begin</span>
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease, delay: 0.15 }}
                    className="font-display text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.92] tracking-tightest"
                >
                    Begin the{" "}
                    <span
                        className="italic"
                        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                    >
                        collaboration
                    </span>
                    .
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease, delay: 0.35 }}
                    className="mt-14 hidden max-w-md md:block"
                >
                    <div className="rule-hairline pt-6">
                        <p className="font-serif text-lg leading-relaxed text-foreground-soft">
                            Create an account to enroll in courses, track orders, save resources,
                            and join the community of marketing obsessives.
                        </p>
                        <p className="eyebrow mt-6">— The Collaborative</p>
                    </div>
                </motion.div>
            </div>

            {/* Form side */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease, delay: 0.25 }}
                className="mt-12 md:col-span-5 md:mt-2"
            >
                <div className="md:sticky md:top-32">
                    <p className="eyebrow mb-8">Create your account</p>

                    {error && (
                        <div className="mb-6 border-l-2 border-destructive bg-destructive/5 px-4 py-3 font-serif text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block font-mono text-2xs font-medium uppercase tracking-widest text-foreground-soft">
                                    First name
                                </label>
                                <input
                                    type="text"
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                    required
                                    className="w-full border-b border-foreground/15 bg-transparent py-3 font-serif text-lg text-foreground placeholder:text-foreground-soft/40 focus:border-primary focus:outline-none focus-visible:outline-none"
                                />
                                {getFieldError('firstName') && (
                                    <p className="mt-2 font-mono text-2xs uppercase tracking-widest text-destructive">{getFieldError('firstName')}</p>
                                )}
                            </div>
                            <div>
                                <label className="block font-mono text-2xs font-medium uppercase tracking-widest text-foreground-soft">
                                    Last name
                                </label>
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                    required
                                    className="w-full border-b border-foreground/15 bg-transparent py-3 font-serif text-lg text-foreground placeholder:text-foreground-soft/40 focus:border-primary focus:outline-none focus-visible:outline-none"
                                />
                                {getFieldError('lastName') && (
                                    <p className="mt-2 font-mono text-2xs uppercase tracking-widest text-destructive">{getFieldError('lastName')}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block font-mono text-2xs font-medium uppercase tracking-widest text-foreground-soft">
                                Email
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                className="w-full border-b border-foreground/15 bg-transparent py-3 font-serif text-lg text-foreground placeholder:text-foreground-soft/40 focus:border-primary focus:outline-none focus-visible:outline-none"
                                placeholder="you@example.com"
                            />
                            {getFieldError('email') && (
                                <p className="mt-2 font-mono text-2xs uppercase tracking-widest text-destructive">{getFieldError('email')}</p>
                            )}
                        </div>

                        <div>
                            <label className="block font-mono text-2xs font-medium uppercase tracking-widest text-foreground-soft">
                                Password
                            </label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                minLength={8}
                                className="w-full border-b border-foreground/15 bg-transparent py-3 font-serif text-lg text-foreground placeholder:text-foreground-soft/40 focus:border-primary focus:outline-none focus-visible:outline-none"
                                placeholder="Min. 8 characters"
                            />
                            {getFieldError('password') && (
                                <p className="mt-2 font-mono text-2xs uppercase tracking-widest text-destructive">{getFieldError('password')}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-primary px-8 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-all hover:gap-5 hover:bg-primary/90 disabled:opacity-60"
                        >
                            {loading ? 'Creating account…' : 'Create account'}
                            {!loading && (
                                <ArrowRight
                                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                    strokeWidth={1.5}
                                />
                            )}
                        </button>
                    </form>

                    <div className="mt-12 border-t border-foreground/10 pt-6">
                        <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            Already a member?{' '}
                            <Link href="/login" className="text-foreground transition-colors hover:text-primary">
                                Sign in →
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
