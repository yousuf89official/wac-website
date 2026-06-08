'use client';

import { useState, use } from 'react';
import { Loader2, Eye, EyeOff, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

// Identity lives in WAC (Phase 4) — sign-in is on the WAC app, not a CI /auth route.
const WAC_BASE_URL = process.env.NEXT_PUBLIC_WAC_URL || 'https://wearecollaborative.net';

export default function RegisterPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleAtWork, setRoleAtWork] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Password validation
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
            const res = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, name, email, password, roleAtWork }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed');
            } else {
                setSuccess(true);
                setTimeout(() => { window.location.href = `${WAC_BASE_URL}/login`; }, 3000);
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="w-full max-w-md text-center">
                    <div className="bg-card border border-border rounded-lg p-10">
                        <div className="w-14 h-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-7 w-7 text-success" />
                        </div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground-soft mb-4">
                            Intelligence · Welcome
                        </p>
                        <h2 className="font-fraunces text-3xl text-foreground leading-[1.1] mb-3">
                            Registration successful.
                        </h2>
                        <p className="font-newsreader text-sm text-foreground-soft mb-1">
                            Your account is pending admin approval.
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/40 mt-4">
                            Redirecting to sign in…
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="grid lg:grid-cols-2 min-h-screen">
                {/* Left — editorial */}
                <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-background-2 border-r border-border">
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground-soft">
                            Intelligence · Begin
                        </p>
                    </div>
                    <div className="max-w-md">
                        <h1 className="font-fraunces text-5xl xl:text-6xl text-foreground leading-[1.05] tracking-tight mb-8">
                            Begin.
                        </h1>
                        <blockquote className="font-newsreader text-lg text-foreground-soft italic leading-relaxed border-l-2 border-primary pl-6">
                            &ldquo;Clarity isn&rsquo;t a feature. It&rsquo;s a posture — one we earn slowly, then defend daily.&rdquo;
                        </blockquote>
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50 mt-6 pl-6">
                            — Collaborative Intelligence
                        </p>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
                        Enterprise Analytics Platform
                    </p>
                </div>

                {/* Right — form */}
                <div className="flex items-center justify-center px-6 py-12 lg:px-12 xl:px-16">
                    <div className="w-full max-w-md">
                        <div className="mb-10">
                            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground-soft mb-3 lg:hidden">
                                Intelligence · Begin
                            </p>
                            <h2 className="font-fraunces text-3xl text-foreground leading-[1.1] tracking-tight mb-2">
                                Create your account
                            </h2>
                            <p className="font-newsreader text-base text-foreground-soft">
                                You&rsquo;ve been invited to join the platform.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-7">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft block">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full h-11 bg-transparent border-0 border-b border-border text-foreground text-base font-newsreader placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft block">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    className="w-full h-11 bg-transparent border-0 border-b border-border text-foreground text-base font-newsreader placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft block">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min 8 characters, letters & numbers"
                                        className="w-full h-11 bg-transparent border-0 border-b border-border pr-10 text-foreground text-base font-newsreader placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {password.length > 0 && (
                                    <div className="space-y-1 mt-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-success' : 'bg-border'}`} />
                                            <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${hasMinLength ? 'text-success' : 'text-foreground/40'}`}>At least 8 characters</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${hasLetter ? 'bg-success' : 'bg-border'}`} />
                                            <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${hasLetter ? 'text-success' : 'text-foreground/40'}`}>Contains letters</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-success' : 'bg-border'}`} />
                                            <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${hasNumber ? 'text-success' : 'text-foreground/40'}`}>Contains numbers</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Role at Work */}
                            <div className="space-y-2">
                                <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft block">
                                    Role at Work
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={roleAtWork}
                                    onChange={(e) => setRoleAtWork(e.target.value)}
                                    placeholder="e.g. Marketing Manager, Analyst"
                                    className="w-full h-11 bg-transparent border-0 border-b border-border text-foreground text-base font-newsreader placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {error && (
                                <div className="px-4 py-3 rounded bg-destructive/10 border border-destructive/30 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                                    <p className="font-newsreader text-sm text-destructive">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !isPasswordValid}
                                className="w-full h-12 rounded bg-primary text-primary-foreground font-mono text-[11px] uppercase tracking-[0.22em] hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating account…
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="h-4 w-4" />
                                        Create Account
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-border text-center">
                            <p className="font-newsreader text-sm text-foreground-soft">
                                Already have an account?{' '}
                                <a href={`${WAC_BASE_URL}/login`} className="text-primary hover:opacity-80 transition-opacity">Sign in</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
