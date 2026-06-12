'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, Check } from 'lucide-react';

export default function CIRegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isPasswordValid = hasMinLength && hasLetter && hasNumber;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPasswordValid) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Registration failed');
                setLoading(false);
                return;
            }
            window.location.href = '/dashboard';
        } catch {
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    const Rule = ({ ok, label }: { ok: boolean; label: string }) => (
        <span className={`flex items-center gap-1.5 ${ok ? 'text-foreground' : 'text-muted-foreground'}`}>
            <Check className={`h-3 w-3 ${ok ? 'opacity-100' : 'opacity-30'}`} />
            {label}
        </span>
    );

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
                        Collaborative Intelligence
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                        Create your account
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Get started with campaign intelligence.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-border bg-card p-8 shadow-sm"
                >
                    {error && (
                        <div className="mb-5 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <label className="block text-sm font-medium text-foreground" htmlFor="name">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1.5 mb-5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="Your name"
                    />

                    <label className="block text-sm font-medium text-foreground" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1.5 mb-5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="you@company.com"
                    />

                    <label className="block text-sm font-medium text-foreground" htmlFor="password">
                        Password
                    </label>
                    <div className="relative mt-1.5">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            tabIndex={-1}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <Rule ok={hasMinLength} label="8+ characters" />
                        <Rule ok={hasLetter} label="A letter" />
                        <Rule ok={hasNumber} label="A number" />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !isPasswordValid}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? 'Creating account…' : 'Create account'}
                    </button>

                    <p className="mt-5 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
