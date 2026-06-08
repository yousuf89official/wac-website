'use client';

import { useState, useEffect, use } from 'react';
// Phase 4: auth lives in WAC. The portal still shows whitelabel branding +
// collects the email locally for analytics, but the actual sign-in handoff is
// a redirect to the WAC /login page with returnTo back to this portal.
const WAC_BASE_URL = process.env.NEXT_PUBLIC_WAC_URL || 'https://wearecollaborative.net';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface PortalConfig {
    brandName: string;
    logo: string | null;
    primaryColor: string;
    accentColor: string;
    loginMessage: string | null;
    customCss: string | null;
}

export default function ClientPortalPage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = use(params);
    const [config, setConfig] = useState<PortalConfig | null>(null);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`/api/whitelabel/lookup?domain=${encodeURIComponent(domain)}`)
            .then(r => {
                if (!r.ok) { setNotFound(true); setLoadingConfig(false); return null; }
                return r.json();
            })
            .then(data => { if (data) { setConfig(data); setLoadingConfig(false); } })
            .catch(() => { setNotFound(true); setLoadingConfig(false); });
    }, [domain]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Auth lives in WAC. Bounce there with returnTo + prefilled email,
            // then WAC redirects back to /dashboard on success.
            const returnTo = encodeURIComponent(`${window.location.origin}/dashboard`);
            const prefill = encodeURIComponent(email);
            window.location.href = `${WAC_BASE_URL}/login?returnTo=${returnTo}&email=${prefill}`;
        } catch {
            setError('An unexpected error occurred');
            setLoading(false);
        }
        // Note: 'password' state is intentionally unused now (left for backward
        // compat with the existing form). Whitelabel portal can be redesigned
        // to drop the password field entirely in a follow-up.
        void password;
    };

    if (loadingConfig) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-foreground/30" />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="text-center">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground-soft mb-3">404</p>
                    <h1 className="font-fraunces text-4xl text-foreground mb-2">Portal not found</h1>
                    <p className="font-newsreader text-base text-foreground-soft">This portal does not exist.</p>
                </div>
            </div>
        );
    }

    // Brand-driven dynamic colors — preserved intentionally for whitelabel
    const primary = config?.primaryColor || '#C8553D';
    const accent = config?.accentColor || '#C8553D';

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden">
            {/* Background effect uses brand color */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${primary}15 0%, transparent 70%)` }} />

            {/* Custom CSS injection */}
            {config?.customCss && <style dangerouslySetInnerHTML={{ __html: config.customCss }} />}

            <div className="w-full max-w-sm relative z-10">
                {/* Logo / Brand */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    {config?.logo ? (
                        <img src={config.logo} alt={config.brandName} className="h-10 w-auto" />
                    ) : (
                        <div className="h-10 w-10 rounded flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
                            <span className="text-primary-foreground font-bold text-lg">{config?.brandName?.charAt(0) || 'C'}</span>
                        </div>
                    )}
                    <span className="font-fraunces text-xl text-foreground tracking-tight">{config?.brandName || 'Client Portal'}</span>
                </div>

                {/* Login Card */}
                <div className="rounded-lg bg-card border border-border p-8">
                    <div className="mb-7">
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft mb-2">
                            Sign in
                        </p>
                        <h1 className="font-fraunces text-2xl text-foreground mb-2 leading-tight">Welcome back</h1>
                        <p className="font-newsreader text-sm text-foreground-soft">{config?.loginMessage || 'Sign in to access your dashboard.'}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft block">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                className="w-full h-11 bg-transparent border-0 border-b border-border text-foreground text-base font-newsreader placeholder:text-foreground/40 focus:outline-none transition-colors"
                                style={{ borderBottomColor: undefined } as any}
                                onFocus={e => { e.currentTarget.style.borderBottomColor = primary; }}
                                onBlur={e => { e.currentTarget.style.borderBottomColor = ''; }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft block">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full h-11 bg-transparent border-0 border-b border-border pr-10 text-foreground text-base font-newsreader placeholder:text-foreground/40 focus:outline-none transition-colors"
                                    onFocus={e => { e.currentTarget.style.borderBottomColor = primary; }}
                                    onBlur={e => { e.currentTarget.style.borderBottomColor = ''; }}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="px-3 py-2 rounded bg-destructive/10 border border-destructive/30">
                                <p className="font-newsreader text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full h-12 rounded font-mono text-[11px] uppercase tracking-[0.22em] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ background: primary, color: '#fff' }}>
                            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : 'Sign In'}
                        </button>
                    </form>
                </div>

                <p className="text-center font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40 mt-6">
                    Powered by Collaborative Intelligence
                </p>
            </div>
        </div>
    );
}
