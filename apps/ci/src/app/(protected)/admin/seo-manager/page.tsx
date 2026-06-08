'use client';

import { useState } from 'react';
import { Search, CheckCircle, AlertTriangle, XCircle, Globe, TrendingUp, BarChart3, RefreshCw } from 'lucide-react';

interface PageAudit {
    page: string;
    route: string;
    seoScore: number;
    geoScore: number;
    aeoScore: number;
    issues: { type: 'error' | 'warning' | 'pass'; message: string }[];
    meta: { title: string; description: string; keywords: number; ogTags: boolean; schema: boolean; canonical: boolean };
}

const AUDIT_DATA: PageAudit[] = [
    {
        page: 'Home Page',
        route: '/',
        seoScore: 92,
        geoScore: 85,
        aeoScore: 78,
        issues: [
            { type: 'pass', message: 'Title tag present and within 60 characters' },
            { type: 'pass', message: 'Meta description within 155 characters' },
            { type: 'pass', message: 'OpenGraph tags configured' },
            { type: 'pass', message: 'Canonical URL set' },
            { type: 'pass', message: 'H1 tag present' },
            { type: 'warning', message: 'Missing hreflang tags for multi-language support' },
            { type: 'warning', message: 'AEO: Add FAQ schema for voice search optimization' },
            { type: 'pass', message: '10 high-intent keywords found in metadata' },
        ],
        meta: { title: 'Collaborative Intelligence | Unified Campaign Intelligence', description: 'Enterprise-grade campaign analytics...', keywords: 10, ogTags: true, schema: false, canonical: true },
    },
    {
        page: 'About Page',
        route: '/about',
        seoScore: 88,
        geoScore: 72,
        aeoScore: 65,
        issues: [
            { type: 'pass', message: 'Title tag optimized for brand + category keywords' },
            { type: 'pass', message: 'Meta description present' },
            { type: 'pass', message: 'OpenGraph tags configured' },
            { type: 'warning', message: 'Missing structured data (Organization schema)' },
            { type: 'warning', message: 'GEO: Add local business schema for Jakarta office' },
            { type: 'error', message: 'AEO: No FAQ or HowTo schema found' },
            { type: 'warning', message: 'Image alt attributes missing on team photos' },
        ],
        meta: { title: 'About Us — Unified Campaign Intelligence Platform', description: 'Learn about Collaborative Intelligence...', keywords: 4, ogTags: true, schema: false, canonical: false },
    },
    {
        page: 'Pricing Page',
        route: '/pricing',
        seoScore: 85,
        geoScore: 68,
        aeoScore: 82,
        issues: [
            { type: 'pass', message: 'Title tag with high-intent keyword "pricing"' },
            { type: 'pass', message: 'Meta description mentions pricing and plans' },
            { type: 'warning', message: 'Missing Product schema with pricing offers' },
            { type: 'warning', message: 'GEO: Add currency localization for target markets' },
            { type: 'pass', message: 'FAQ section present — good for AEO' },
            { type: 'warning', message: 'Consider adding comparison table for rich snippets' },
        ],
        meta: { title: 'Pricing — Enterprise Media Intelligence Plans', description: 'Flexible pricing for teams...', keywords: 4, ogTags: true, schema: false, canonical: false },
    },
    {
        page: 'Blog Page',
        route: '/blog',
        seoScore: 80,
        geoScore: 60,
        aeoScore: 70,
        issues: [
            { type: 'pass', message: 'Title tag present with category keywords' },
            { type: 'pass', message: 'Meta description present' },
            { type: 'error', message: 'Missing Article schema on blog posts' },
            { type: 'error', message: 'Missing breadcrumb navigation schema' },
            { type: 'warning', message: 'No XML sitemap entry for individual posts' },
            { type: 'warning', message: 'GEO: Add regional content targeting' },
            { type: 'pass', message: 'Category filter supports AEO topic clustering' },
        ],
        meta: { title: 'Blog — Media Intelligence Insights', description: 'Expert insights on media intelligence...', keywords: 5, ogTags: true, schema: false, canonical: false },
    },
    {
        page: 'Contact Page',
        route: '/contact',
        seoScore: 83,
        geoScore: 90,
        aeoScore: 75,
        issues: [
            { type: 'pass', message: 'Title tag with "contact" intent keyword' },
            { type: 'pass', message: 'GEO: Physical address (Jakarta) present' },
            { type: 'pass', message: 'Phone number and email visible' },
            { type: 'warning', message: 'Missing LocalBusiness schema' },
            { type: 'warning', message: 'Add Google Maps embed for GEO signal' },
            { type: 'pass', message: 'Lead gen form present for conversion tracking' },
        ],
        meta: { title: 'Contact Us — Get in Touch', description: 'Contact the Collaborative Intelligence team...', keywords: 4, ogTags: true, schema: false, canonical: false },
    },
];

function ScoreCircle({ score, label, size = 'lg' }: { score: number; label: string; size?: 'sm' | 'lg' }) {
    const color = score >= 90 ? 'hsl(var(--success))' : score >= 70 ? 'hsl(var(--primary))' : score >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';
    const radius = size === 'lg' ? 40 : 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative">
                <svg width={radius * 2 + 16} height={radius * 2 + 16} className="transform -rotate-90">
                    <circle cx={radius + 8} cy={radius + 8} r={radius} fill="none" stroke="hsl(var(--foreground) / 0.05)" strokeWidth={size === 'lg' ? 6 : 4} />
                    <circle cx={radius + 8} cy={radius + 8} r={radius} fill="none" stroke={color} strokeWidth={size === 'lg' ? 6 : 4} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`font-bold text-foreground ${size === 'lg' ? 'text-2xl' : 'text-sm'}`}>{score}</span>
                </div>
            </div>
            <span className={`font-medium text-foreground-soft ${size === 'lg' ? 'text-xs' : 'text-[10px]'}`}>{label}</span>
        </div>
    );
}

export default function SeoManagerPage() {
    const [selectedPage, setSelectedPage] = useState(0);
    const [auditing, setAuditing] = useState(false);

    const page = AUDIT_DATA[selectedPage];
    const overallSeo = Math.round(AUDIT_DATA.reduce((s, p) => s + p.seoScore, 0) / AUDIT_DATA.length);
    const overallGeo = Math.round(AUDIT_DATA.reduce((s, p) => s + p.geoScore, 0) / AUDIT_DATA.length);
    const overallAeo = Math.round(AUDIT_DATA.reduce((s, p) => s + p.aeoScore, 0) / AUDIT_DATA.length);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · SEO Manager
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    SEO / GEO / AEO Manager
                </h1>
                <p className="mt-4 text-foreground-soft max-w-2xl">
                    Comprehensive search engine, geographic, and answer engine optimization scoring with real-time auditing across all public pages.
                </p>
                <div className="mt-6">
                    <button onClick={() => { setAuditing(true); setTimeout(() => setAuditing(false), 2000); }} className="flex items-center gap-2 px-6 py-2 bg-primary text-foreground rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        <Search className="h-4 w-4" />
                        <RefreshCw className={`h-4 w-4 ${auditing ? 'animate-spin' : ''}`} /> RUN FULL AUDIT
                    </button>
                </div>
            </header>

            {/* Overall Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { score: overallSeo, label: 'SEO Score', sub: 'Search Engine Optimization', desc: 'Technical SEO (30%) + On-Page (35%) + Content (20%) + Off-Page (15%)', icon: Search },
                    { score: overallGeo, label: 'GEO Score', sub: 'Geographic Optimization', desc: 'Local Schema (25%) + NAP (20%) + Hreflang (20%) + Regional (20%) + Maps (15%)', icon: Globe },
                    { score: overallAeo, label: 'AEO Score', sub: 'Answer Engine Optimization', desc: 'FAQ Schema (30%) + HowTo (20%) + Voice Optimized (25%) + Featured Snippets (25%)', icon: TrendingUp },
                ].map((item) => (
                    <div key={item.label} className="p-6 rounded-2xl border border-border bg-card">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-foreground text-lg">{item.label}</h3>
                                <p className="text-[10px] text-foreground-soft uppercase tracking-wider">{item.sub}</p>
                            </div>
                            <ScoreCircle score={item.score} label="" />
                        </div>
                        <p className="text-[10px] text-foreground-soft mt-2">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* Page-by-Page Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="col-span-1 lg:col-span-4 space-y-2">
                    <h3 className="text-xs font-bold text-foreground-soft uppercase tracking-wider px-2 mb-3">Pages</h3>
                    {AUDIT_DATA.map((p, idx) => (
                        <button
                            key={p.route}
                            onClick={() => setSelectedPage(idx)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${selectedPage === idx ? 'bg-primary/10 border border-primary/20' : 'border border-transparent hover:bg-card'}`}
                        >
                            <div className="text-left">
                                <p className="text-sm font-medium text-foreground">{p.page}</p>
                                <p className="text-[10px] text-foreground-soft">{p.route}</p>
                            </div>
                            <div className="flex gap-2">
                                <ScoreCircle score={p.seoScore} label="SEO" size="sm" />
                                <ScoreCircle score={p.geoScore} label="GEO" size="sm" />
                                <ScoreCircle score={p.aeoScore} label="AEO" size="sm" />
                            </div>
                        </button>
                    ))}
                </div>

                <div className="col-span-1 lg:col-span-8 space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" /> Meta Analysis — {page.page}
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Title', value: page.meta.title, max: '60 chars' },
                                { label: 'Description', value: page.meta.description, max: '155 chars' },
                            ].map(m => (
                                <div key={m.label} className="col-span-3 p-3 rounded-lg bg-card">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[10px] text-foreground-soft font-medium">{m.label}</span>
                                        <span className="text-[10px] text-foreground-soft">{m.max}</span>
                                    </div>
                                    <p className="text-xs text-foreground-soft truncate">{m.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: 'Keywords', value: page.meta.keywords, ok: page.meta.keywords >= 5 },
                                { label: 'OG Tags', value: page.meta.ogTags ? 'Yes' : 'No', ok: page.meta.ogTags },
                                { label: 'Schema', value: page.meta.schema ? 'Yes' : 'No', ok: page.meta.schema },
                                { label: 'Canonical', value: page.meta.canonical ? 'Yes' : 'No', ok: page.meta.canonical },
                            ].map(m => (
                                <div key={m.label} className={`p-3 rounded-lg text-center ${m.ok ? 'bg-success/5 border border-success/10' : 'bg-warning/5 border border-warning/10'}`}>
                                    <p className="text-[10px] text-foreground-soft mb-1">{m.label}</p>
                                    <p className={`text-sm font-bold ${m.ok ? 'text-success' : 'text-warning'}`}>{String(m.value)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
                        <h3 className="font-bold text-foreground mb-4">Audit Issues & Recommendations</h3>
                        {page.issues.map((issue, idx) => (
                            <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${issue.type === 'error' ? 'bg-destructive/5' : issue.type === 'warning' ? 'bg-warning/5' : 'bg-success/5'}`}>
                                {issue.type === 'pass' && <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />}
                                {issue.type === 'warning' && <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />}
                                {issue.type === 'error' && <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />}
                                <span className="text-xs text-foreground-soft">{issue.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
