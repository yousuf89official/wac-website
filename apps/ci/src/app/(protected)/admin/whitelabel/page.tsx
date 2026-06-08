'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, Copy, Globe, Palette, Users, Shield, Settings, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice, detectRegion } from '@/lib/region';

export default function WhitelabelPage() {
    const [activeTab, setActiveTab] = useState<'referrals' | 'plans' | 'setup'>('referrals');
    const [loading, setLoading] = useState(true);
    const [referral, setReferral] = useState<any>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [subscription, setSub] = useState<any>(null);
    const region = detectRegion();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [refRes, plansRes, subRes] = await Promise.allSettled([
                fetch('/api/referrals'),
                fetch(`/api/plans?region=${region.region}`),
                fetch('/api/subscriptions'),
            ]);
            if (refRes.status === 'fulfilled' && refRes.value.ok) setReferral(await refRes.value.json());
            if (plansRes.status === 'fulfilled' && plansRes.value.ok) setPlans(await plansRes.value.json());
            if (subRes.status === 'fulfilled' && subRes.value.ok) {
                const d = await subRes.value.json();
                setSub(d);
            }
        } catch {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [region.region]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const copyLink = () => {
        if (!referral) return;
        navigator.clipboard.writeText(`${window.location.origin}/register/${referral.code}`);
        toast.success('Referral link copied!');
    };

    if (loading) {
        return <div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const stats = referral?.stats;
    const currentPlan = subscription?.plan;
    const currency = subscription?.subscription?.currency || region.currency;

    // Milestone definitions
    const MILESTONES = [
        { key: 'first_referral', threshold: 1, bonus: 50, boost: 0, label: 'First Referral', badge: 'Starter' },
        { key: 'five_referrals', threshold: 5, bonus: 200, boost: 2, label: '5 Active Referrals', badge: 'Bronze' },
        { key: 'ten_referrals', threshold: 10, bonus: 500, boost: 3, label: '10 Active Referrals', badge: 'Silver' },
        { key: 'twenty_five', threshold: 25, bonus: 1000, boost: 5, label: '25 Active Referrals', badge: 'Gold' },
        { key: 'fifty', threshold: 50, bonus: 2500, boost: 5, label: '50 Active Referrals', badge: 'Platinum' },
        { key: 'hundred', threshold: 100, bonus: 5000, boost: 5, label: '100 Active Referrals', badge: 'Partner' },
    ];

    const claimedMilestones = new Set((referral?.milestones || []).map((m: any) => m.milestone));
    const activeReferrals = stats?.activeReferrals || 0;

    // Determine current tier
    const currentTier = MILESTONES.slice().reverse().find(m => activeReferrals >= m.threshold)?.badge || 'None';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · Whitelabel
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    Whitelabel & Referral Program
                </h1>
                <p className="mt-4 text-foreground-soft max-w-2xl">
                    Grow your revenue through referrals and white-label partnerships.
                </p>
                <div className="mt-6">
                    <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-xl font-bold text-xs hover:bg-card transition-all">
                        <RefreshCw className="h-4 w-4" /> REFRESH
                    </button>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl border border-border bg-card">
                    <p className="text-[10px] text-foreground-soft uppercase tracking-wider mb-1">Referral Tier</p>
                    <p className="text-2xl font-bold text-primary">{currentTier}</p>
                    <p className="text-[10px] text-foreground-soft mt-1">{activeReferrals} active referrals</p>
                </div>
                <div className="p-5 rounded-xl border border-border bg-card">
                    <p className="text-[10px] text-foreground-soft uppercase tracking-wider mb-1">Commission Rate</p>
                    <p className="text-2xl font-bold text-foreground">{stats ? `${(stats.effectiveRate * 100).toFixed(0)}%` : '10%'}</p>
                    <p className="text-[10px] text-foreground-soft mt-1">base {stats ? `${(stats.baseCommissionRate * 100).toFixed(0)}%` : '10%'} + {stats ? `${(stats.totalBoost * 100).toFixed(0)}%` : '0%'} boost</p>
                </div>
                <div className="p-5 rounded-xl border border-border bg-card">
                    <p className="text-[10px] text-foreground-soft uppercase tracking-wider mb-1">Total Earned</p>
                    <p className="text-2xl font-bold text-success">{formatPrice(stats?.totalEarnings || 0, currency)}</p>
                    <p className="text-[10px] text-foreground-soft mt-1">{formatPrice(stats?.pendingEarnings || 0, currency)} pending</p>
                </div>
                <div className="p-5 rounded-xl border border-border bg-card">
                    <p className="text-[10px] text-foreground-soft uppercase tracking-wider mb-1">Link Clicks</p>
                    <p className="text-2xl font-bold text-foreground">{referral?.clicks || 0}</p>
                    <p className="text-[10px] text-foreground-soft mt-1">{stats?.totalReferrals || 0} converted</p>
                </div>
            </div>

            {/* Referral Link */}
            <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-foreground text-sm mb-1">Your Referral Link</h3>
                    <p className="text-xs text-foreground-soft">Share this link to earn {stats ? `${(stats.effectiveRate * 100).toFixed(0)}%` : '10%'} recurring commission on every subscriber</p>
                </div>
                <div className="flex items-center gap-2">
                    <code className="px-3 py-2 rounded-lg bg-background-2 text-primary text-xs font-mono">{referral?.code || '—'}</code>
                    <button onClick={copyLink} className="px-4 py-2 bg-primary text-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5">
                        <Copy className="h-3.5 w-3.5" /> Copy Link
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
                {[
                    { id: 'referrals', label: 'The Growth Network' },
                    { id: 'plans', label: 'Plans & Quotas' },
                    { id: 'setup', label: 'White-Label Setup' },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-foreground-soft'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* The Growth Network Tab */}
            {activeTab === 'referrals' && (
                <div className="space-y-6">
                    {/* 3-Layer Explanation */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 rounded-2xl border border-border bg-card">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-foreground text-xs font-bold mb-3">1</div>
                            <h4 className="font-bold text-foreground text-sm mb-1">Direct Commission</h4>
                            <p className="text-xs text-foreground-soft">Earn {stats ? `${(stats.baseCommissionRate * 100).toFixed(0)}%` : '10-30%'} recurring on every referral&apos;s subscription — forever.</p>
                        </div>
                        <div className="p-5 rounded-2xl border border-border bg-card">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent flex items-center justify-center text-foreground text-xs font-bold mb-3">2</div>
                            <h4 className="font-bold text-foreground text-sm mb-1">Network Boost</h4>
                            <p className="text-xs text-foreground-soft">Earn 5% on your referrals&apos; referrals. When they grow, you earn more.</p>
                        </div>
                        <div className="p-5 rounded-2xl border border-border bg-card">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warning to-destructive flex items-center justify-center text-foreground text-xs font-bold mb-3">3</div>
                            <h4 className="font-bold text-foreground text-sm mb-1">Milestone Accelerators</h4>
                            <p className="text-xs text-foreground-soft">Hit referral milestones to unlock cash bonuses and permanent commission boosts.</p>
                        </div>
                    </div>

                    {/* Milestone Progress */}
                    <div className="p-6 rounded-2xl border border-border bg-card">
                        <h3 className="font-bold text-foreground mb-4">Milestone Accelerators</h3>
                        <div className="space-y-3">
                            {MILESTONES.map(m => {
                                const claimed = claimedMilestones.has(m.key);
                                const progress = Math.min(100, (activeReferrals / m.threshold) * 100);
                                return (
                                    <div key={m.key} className={`p-4 rounded-xl border ${claimed ? 'border-success/20 bg-success/5' : activeReferrals >= m.threshold ? 'border-warning/20 bg-warning/5' : 'border-border bg-card'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${claimed ? 'bg-success/10 text-success' : 'bg-card text-foreground-soft'}`}>{m.badge}</span>
                                                <span className={`text-xs font-bold ${claimed ? 'text-success' : 'text-foreground'}`}>{m.label}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] text-foreground-soft">
                                                <span>${m.bonus} bonus</span>
                                                {m.boost > 0 && <span className="text-primary font-bold">+{m.boost}% commission</span>}
                                                {claimed && <Check className="h-4 w-4 text-success" />}
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-card rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all ${claimed ? 'bg-success' : 'bg-gradient-to-r from-primary to-accent'}`} style={{ width: `${claimed ? 100 : progress}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Referral List */}
                    {referral?.referrals?.length > 0 && (
                        <div className="p-6 rounded-2xl border border-border bg-card">
                            <h3 className="font-bold text-foreground mb-4">Your Referrals ({referral.referrals.length})</h3>
                            <div className="space-y-2">
                                {referral.referrals.map((r: any) => (
                                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-foreground text-xs font-bold">
                                                {(r.user?.name || r.user?.email || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-foreground">{r.user?.name || 'Unknown'}</p>
                                                <p className="text-[10px] text-foreground-soft">{r.user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${r.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{r.status}</span>
                                            <span className="text-xs font-bold text-foreground">{formatPrice(r.totalCommission || 0, currency)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Plans Tab - from database */}
            {activeTab === 'plans' && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {plans.map((p: any) => {
                        const isCurrent = p.slug === (currentPlan?.slug || 'free');
                        const isEnterprise = p.slug === 'enterprise';
                        return (
                            <div key={p.id} className={`p-5 rounded-2xl border  ${isCurrent ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
                                {isCurrent && <span className="text-[10px] font-bold text-primary uppercase">Current</span>}
                                <h3 className="text-lg font-bold text-foreground">{p.name}</h3>
                                <div className="my-3">
                                    {p.pricing ? (
                                        <span className="text-2xl font-bold text-foreground">{formatPrice(p.pricing.monthly, p.pricing.currency)}<span className="text-xs text-foreground-soft">/mo</span></span>
                                    ) : p.slug === 'free' ? (
                                        <span className="text-2xl font-bold text-foreground">Free</span>
                                    ) : (
                                        <span className="text-2xl font-bold text-foreground">Custom</span>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    {[
                                        { k: 'brands', l: 'Brands' },
                                        { k: 'users', l: 'Users' },
                                        { k: 'whitelabelDomains', l: 'WL Domains' },
                                        { k: 'integrations', l: 'Integrations' },
                                    ].map(q => (
                                        <div key={q.k} className="flex justify-between text-xs">
                                            <span className="text-foreground-soft">{q.l}</span>
                                            <span className="font-bold text-foreground">{p.quotas[q.k] === -1 ? '∞' : p.quotas[q.k]}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-xs">
                                        <span className="text-foreground-soft">Commission</span>
                                        <span className="font-bold text-primary">{((p.quotas.referralCommission || 0.10) * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Setup Guide Tab */}
            {activeTab === 'setup' && (
                <div className="space-y-6 max-w-3xl">
                    {[
                        { step: '1', icon: Globe, title: 'Configure Custom Domain', desc: 'Point your agency domain to our platform via CNAME record. SSL is automatically provisioned.' },
                        { step: '2', icon: Palette, title: 'Brand Customization', desc: 'Upload your logo, set brand colors, custom email templates, and login page styling.' },
                        { step: '3', icon: Users, title: 'Invite Team & Clients', desc: 'Create user accounts for your team and set up client workspaces with appropriate access levels.' },
                        { step: '4', icon: Shield, title: 'Security Setup', desc: 'Configure SSO/SAML, IP whitelisting, and data retention policies for your organization.' },
                        { step: '5', icon: Settings, title: 'Feature Configuration', desc: 'Enable/disable platform features per client. Set usage limits and billing thresholds.' },
                    ].map(s => (
                        <div key={s.step} className="flex gap-4 p-6 rounded-xl border border-border bg-card hover:border-primary/20 transition-all">
                            <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-foreground font-bold text-sm">{s.step}</div>
                            <div>
                                <h4 className="font-bold text-foreground mb-1 flex items-center gap-2"><s.icon className="h-4 w-4 text-primary" /> {s.title}</h4>
                                <p className="text-xs text-foreground-soft">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
