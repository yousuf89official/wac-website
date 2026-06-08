"use client";

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

export default function ResetPasswordPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = use(params);
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    // Mirror the API contract (resetPasswordSchema): min 8 chars.
    const isLongEnough = password.length >= 8;
    const matches = password.length > 0 && password === confirm;
    const canSubmit = isLongEnough && matches;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) {
            setError(!isLongEnough ? 'Password must be at least 8 characters' : 'Passwords do not match');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/customer/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Could not reset your password. The link may have expired.');
                return;
            }

            setDone(true);
            setTimeout(() => router.push('/login'), 2500);
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
                    <span>{done ? 'All set' : 'Set a new password'}</span>
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease, delay: 0.15 }}
                    className="font-display text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.92] tracking-tightest"
                >
                    {done ? (
                        <>
                            You&rsquo;re back{" "}
                            <span className="italic" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}>
                                in
                            </span>
                            .
                        </>
                    ) : (
                        <>
                            New{" "}
                            <span className="italic" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}>
                                password
                            </span>
                            .
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
                            {done
                                ? 'Your password has been updated. Redirecting you to sign in…'
                                : 'Choose a strong password — at least 8 characters. This one-time link expires an hour after it was requested.'}
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
                    {done ? (
                        <div>
                            <p className="eyebrow mb-8">Password updated</p>
                            <p className="font-serif text-lg leading-relaxed text-foreground">
                                You can now sign in with your new password.
                            </p>
                            <div className="mt-12 border-t border-foreground/10 pt-6">
                                <Link
                                    href="/login"
                                    className="font-mono text-2xs uppercase tracking-widest text-foreground transition-colors hover:text-primary"
                                >
                                    Go to sign in →
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="eyebrow mb-8">Choose a new password</p>

                            {error && (
                                <div className="mb-6 border-l-2 border-destructive bg-destructive/5 px-4 py-3 font-serif text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <label className="block font-mono text-2xs font-medium uppercase tracking-widest text-foreground-soft">
                                        New password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full border-b border-foreground/15 bg-transparent py-3 pr-10 font-serif text-lg text-foreground placeholder:text-foreground-soft/40 focus:border-primary focus:outline-none focus-visible:outline-none"
                                            placeholder="At least 8 characters"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((s) => !s)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground-soft transition-colors hover:text-foreground"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-mono text-2xs font-medium uppercase tracking-widest text-foreground-soft">
                                        Confirm password
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        required
                                        className="w-full border-b border-foreground/15 bg-transparent py-3 font-serif text-lg text-foreground placeholder:text-foreground-soft/40 focus:border-primary focus:outline-none focus-visible:outline-none"
                                        placeholder="Re-enter your password"
                                    />
                                    {confirm.length > 0 && !matches && (
                                        <p className="mt-2 font-mono text-2xs uppercase tracking-widest text-destructive">
                                            Passwords don&rsquo;t match
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !canSubmit}
                                    className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-primary px-8 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-all hover:gap-5 hover:bg-primary/90 disabled:opacity-60"
                                >
                                    {loading ? 'Updating…' : 'Update password'}
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
