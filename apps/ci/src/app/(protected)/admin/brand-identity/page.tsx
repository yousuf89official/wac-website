'use client';

import { useState } from 'react';
import { Save, Eye, RefreshCw } from 'lucide-react';

// Hex defaults below are managed brand data — kept as-is.
const DEFAULT_IDENTITY = {
    brandName: 'Collaborative Intelligence',
    tagline: 'Unified Campaign Intelligence for Data-Driven Brands',
    primaryColor: '#0D9488',
    secondaryColor: '#4F46E5',
    darkBg: '#0a0a0f',
    surfaceBg: '#161616',
    accentGreen: '#22c55e',
    accentTeal: '#20C997',
    fontPrimary: 'Poppins',
    fontSecondary: 'Inter',
    borderRadius: '12',
    logoIcon: 'hub',
    navStyle: 'glass-dark',
    heroStyle: 'gradient-orbs',
    cardStyle: 'glass-morphism',
};

function ColorSwatch({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-medium text-foreground-soft">{label}</label>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-12 h-12 rounded-lg border border-border cursor-pointer bg-transparent" />
                </div>
                <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 px-4 py-2.5 rounded-lg bg-card border border-border text-foreground font-mono text-xs focus:outline-none focus:border-primary/50 transition-all" />
            </div>
        </div>
    );
}

export default function BrandIdentityPage() {
    const [identity, setIdentity] = useState(DEFAULT_IDENTITY);
    const [saving, setSaving] = useState(false);

    const update = (key: string, value: string) => {
        setIdentity(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · Brand Identity
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    Brand Identity
                </h1>
                <p className="mt-4 text-foreground-soft max-w-2xl">
                    Customize the look and feel of the public site. Colors, typography, logo, and visual style are all configurable.
                </p>
                <div className="mt-6 flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-xl font-bold text-xs hover:bg-card transition-all">
                        <RefreshCw className="h-4 w-4" /> RESET TO DEFAULT
                    </button>
                    <button onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 1500); }} className="flex items-center gap-2 px-6 py-2 bg-primary text-foreground rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        <Save className="h-4 w-4" /> {saving ? 'SAVING...' : 'SAVE IDENTITY'}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Settings */}
                <div className="col-span-1 lg:col-span-7 space-y-8">
                    {/* Brand Info */}
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
                        <h3 className="font-bold text-foreground">Brand Information</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-foreground-soft">Brand Name</label>
                                <input value={identity.brandName} onChange={(e) => update('brandName', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-foreground-soft">Tagline</label>
                                <input value={identity.tagline} onChange={(e) => update('tagline', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-foreground-soft">Logo Icon (Material Symbol)</label>
                                    <input value={identity.logoIcon} onChange={(e) => update('logoIcon', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-foreground-soft">Border Radius (px)</label>
                                    <input type="number" value={identity.borderRadius} onChange={(e) => update('borderRadius', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
                        <h3 className="font-bold text-foreground">Color Palette</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <ColorSwatch label="Primary Color" value={identity.primaryColor} onChange={(v) => update('primaryColor', v)} />
                            <ColorSwatch label="Secondary Color" value={identity.secondaryColor} onChange={(v) => update('secondaryColor', v)} />
                            <ColorSwatch label="Dark Background" value={identity.darkBg} onChange={(v) => update('darkBg', v)} />
                            <ColorSwatch label="Surface Background" value={identity.surfaceBg} onChange={(v) => update('surfaceBg', v)} />
                            <ColorSwatch label="Accent Green" value={identity.accentGreen} onChange={(v) => update('accentGreen', v)} />
                            <ColorSwatch label="Accent Teal" value={identity.accentTeal} onChange={(v) => update('accentTeal', v)} />
                        </div>
                    </div>

                    {/* Typography */}
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
                        <h3 className="font-bold text-foreground">Typography</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-foreground-soft">Primary Font</label>
                                <select value={identity.fontPrimary} onChange={(e) => update('fontPrimary', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all">
                                    {['Poppins', 'Inter', 'DM Sans', 'Plus Jakarta Sans', 'Outfit'].map(f => <option key={f} value={f} className="bg-background-2 text-foreground">{f}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-foreground-soft">Secondary Font</label>
                                <select value={identity.fontSecondary} onChange={(e) => update('fontSecondary', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all">
                                    {['Inter', 'Poppins', 'DM Sans', 'IBM Plex Sans', 'Source Sans Pro'].map(f => <option key={f} value={f} className="bg-background-2 text-foreground">{f}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Visual Style */}
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
                        <h3 className="font-bold text-foreground">Visual Style</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { key: 'navStyle', label: 'Navigation', options: ['glass-dark', 'solid-dark', 'transparent'] },
                                { key: 'heroStyle', label: 'Hero Style', options: ['gradient-orbs', 'particles', 'minimal', 'video-bg'] },
                                { key: 'cardStyle', label: 'Card Style', options: ['glass-morphism', 'solid-border', 'elevated', 'minimal'] },
                            ].map(style => (
                                <div key={style.key} className="space-y-2">
                                    <label className="text-xs font-medium text-foreground-soft">{style.label}</label>
                                    <select value={(identity as any)[style.key]} onChange={(e) => update(style.key, e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all">
                                        {style.options.map(o => <option key={o} value={o} className="bg-background-2 text-foreground">{o}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="col-span-1 lg:col-span-5">
                    <div className="sticky top-8 space-y-6">
                        <div className="p-6 rounded-2xl border border-border bg-card">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-foreground text-sm">Live Preview</h3>
                                <Eye className="h-4 w-4 text-foreground-soft" />
                            </div>
                            {/* Mini Preview — inline colors come from user-managed identity state */}
                            <div className="rounded-xl overflow-hidden border border-border" style={{ backgroundColor: identity.darkBg }}>
                                <div className="h-10 border-b border-border flex items-center px-4 gap-3" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${identity.primaryColor}, ${identity.secondaryColor})` }}>
                                        <span className="material-symbols-outlined text-foreground text-xs">{identity.logoIcon}</span>
                                    </div>
                                    <span className="text-[8px] font-bold text-foreground">{identity.brandName}</span>
                                </div>
                                <div className="p-6 text-center relative">
                                    <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(60% 60% at 50% 40%, ${identity.primaryColor}30 0%, transparent 100%)` }} />
                                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: identity.primaryColor }}>
                                        {identity.tagline.split(' ').slice(0, 3).join(' ')}
                                    </p>
                                    <p className="text-base font-bold text-foreground mb-1">{identity.brandName}</p>
                                    <p className="text-[8px] text-foreground-soft mb-4">{identity.tagline}</p>
                                    <div className="flex justify-center gap-2">
                                        <div className="px-3 py-1 rounded-md text-[8px] font-bold text-foreground" style={{ backgroundColor: identity.primaryColor }}>Get Started</div>
                                        <div className="px-3 py-1 rounded-md text-[8px] font-bold text-foreground-soft border border-border">Learn More</div>
                                    </div>
                                </div>
                                <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="p-3 rounded-lg bg-card border border-border">
                                            <div className="w-5 h-5 rounded-md mb-2 flex items-center justify-center" style={{ backgroundColor: `${identity.primaryColor}15`, color: identity.primaryColor }}>
                                                <span className="text-[8px]">★</span>
                                            </div>
                                            <div className="h-1.5 w-8 rounded bg-foreground/10 mb-1" />
                                            <div className="h-1 w-12 rounded bg-foreground/5" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Color Palette Preview */}
                        <div className="p-6 rounded-2xl border border-border bg-card">
                            <h3 className="font-bold text-foreground text-sm mb-4">Active Palette</h3>
                            <div className="flex gap-2">
                                {[identity.primaryColor, identity.secondaryColor, identity.darkBg, identity.surfaceBg, identity.accentGreen, identity.accentTeal].map((c, i) => (
                                    <div key={i} className="flex-1">
                                        <div className="h-12 rounded-lg border border-border mb-1" style={{ backgroundColor: c }} />
                                        <p className="text-[8px] text-foreground-soft text-center font-mono">{c}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
