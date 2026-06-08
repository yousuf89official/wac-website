"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    // Dev-only: the API returns a reset link until email delivery is wired.
    const [devResetLink, setDevResetLink] = useState<string | null>(null);

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

            if (data.resetLink) setDevResetLink(data.resetLink);
            setSent(true);
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
                    <span>{sent ? 'Check your inbox' : 'Reset access'}</span>
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease, delay: 0.15 }}
                    className="font-display text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.92] tracking-tightest"
                >
                    {sent ? (
                        <>
                            Check your{" "}
                            <span
                                className="italic"
                                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                            >
                                inbox
                            </span>
                            .
                        </>
                    ) : (
                        <>
                            <span
                                className="italic"
                                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                            >
                                Reset
                            </span>{" "}
                            access.
                        </>
                    )}
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease, delay: 0.35 }}
                    className="mt-14 hidden max-w-md md:block"
                >
                    <div className="rule-hairline pt-6">
                        <p className="font-serif text-lg leading-relaxed text-foreground-soft">
                            {sent
                                ? 'If an account exists with that address, a one-time reset link is on its way. Links expire after one hour.'
                                : 'Enter your email and we’ll send a one-time link to set a new password. No security questions, no friction.'}
                        </p>
                        <p className="eyebrow mt-6">— The Collaborative</p>
                    </div>
                </motion.div>
            </div>

            {/* Form / confirmation side */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease, delay: 0.25 }}
                className="mt-12 md:col-span-5 md:mt-2"
            >
                <div className="md:sticky md:top-32">
                    {sent ? (
                        <div>
                            <p className="eyebrow mb-8">A link has been sent</p>
                            <p className="font-serif text-lg leading-relaxed text-foreground">
                                If an account exists with{' '}
                                <span className="italic text-primary">{email}</span>, we&rsquo;ve
                                sent a password reset link.
                            </p>
                            {devResetLink && (
                                <div className="mt-8 border-l-2 border-primary/40 bg-primary/5 px-4 py-3">
                                    <p className="mb-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                        Dev only · email delivery not wired yet
                                    </p>
                                    <Link
                                        href={devResetLink}
                                        className="break-all font-mono text-xs text-primary underline-offset-2 hover:underline"
                                    >
                                        {devResetLink}
                                    </Link>
                                </div>
                            )}
                            <div className="mt-12 border-t border-foreground/10 pt-6">
                                <Link
                                    href="/login"
                                    className="font-mono text-2xs uppercase tracking-widest text-foreground transition-colors hover:text-primary"
                                >
                                    Return to sign in →
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="eyebrow mb-8">We&rsquo;ll send a one-time link</p>

                            {error && (
                                <div className="mb-6 border-l-2 border-destructive bg-destructive/5 px-4 py-3 font-serif text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <label className="block font-mono text-2xs font-medium uppercase tracking-widest text-foreground-soft">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full border-b border-foreground/15 bg-transparent py-3 font-serif text-lg text-foreground placeholder:text-foreground-soft/40 focus:border-primary focus:outline-none focus-visible:outline-none"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-primary px-8 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-all hover:gap-5 hover:bg-primary/90 disabled:opacity-60"
                                >
                                    {loading ? 'Sending…' : 'Send reset link'}
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
                                    Remembered it?{' '}
                                    <Link href="/login" className="text-foreground transition-colors hover:text-primary">
                                        Sign in →
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
