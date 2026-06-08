'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Brain, AlertTriangle, CheckCircle,
    Zap, BarChart3, Target, RefreshCw, Loader2,
    ArrowUpRight, ArrowDownRight, Minus, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignScore {
    campaignId: string;
    campaignName: string;
    overallScore: number;
    efficiencyScore: number;
    growthScore: number;
    engagementScore: number;
    spendScore: number;
    trend: 'improving' | 'stable' | 'declining';
    insights: string[];
    metrics: Record<string, number>;
}

interface Anomaly {
    id: string;
    campaignName?: string;
    type: string;
    severity: string;
    metric: string;
    deviationPct: number;
    message: string;
    detectedAt: string;
}

interface BrandSummary {
    headline: string;
    executiveSummary: string;
    keyMetrics: Record<string, number>;
    topPerformers: { name: string; score: number; insight: string }[];
    underperformers: { name: string; score: number; recommendation: string }[];
    recommendations: string[];
    anomalies: { message: string; severity: string }[];
}

interface BenchmarkComparison {
    metric: string;
    label: string;
    brandValue: number;
    industryAvg: number;
    vsIndustry: number;
    vsPrevious: number;
    rating: string;
}

export function IntelligencePanel({ brandId }: { brandId: string }) {
    const [activeView, setActiveView] = useState<'summary' | 'scores' | 'anomalies' | 'benchmarks'>('summary');
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<BrandSummary | null>(null);
    const [scores, setScores] = useState<CampaignScore[]>([]);
    const [anomalies, setAnomalies] = useState<{ anomalies: Anomaly[]; critical: number; warnings: number; total: number } | null>(null);
    const [benchmarks, setBenchmarks] = useState<{ comparisons: BenchmarkComparison[]; overallRating: string } | null>(null);
    const [days, setDays] = useState(30);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const params = `brandId=${brandId}&days=${days}`;
        const [sumRes, scoreRes, anomRes, benchRes] = await Promise.allSettled([
            fetch(`/api/intelligence/summary?${params}`),
            fetch(`/api/intelligence/score?${params}`),
            fetch(`/api/intelligence/anomalies?${params}`),
            fetch(`/api/intelligence/benchmarks?${params}`),
        ]);
        if (sumRes.status === 'fulfilled' && sumRes.value.ok) setSummary(await sumRes.value.json());
        if (scoreRes.status === 'fulfilled' && scoreRes.value.ok) setScores(await scoreRes.value.json());
        if (anomRes.status === 'fulfilled' && anomRes.value.ok) setAnomalies(await anomRes.value.json());
        if (benchRes.status === 'fulfilled' && benchRes.value.ok) setBenchmarks(await benchRes.value.json());
        setLoading(false);
    }, [brandId, days]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const ScoreRing = ({ score, size = 48 }: { score: number; size?: number }) => {
        const radius = (size - 6) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;
        // Sentiment colors preserved as semantic tokens.
        const color = score >= 70 ? 'hsl(var(--success))' : score >= 40 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';
        return (
            <svg width={size} height={size} className="shrink-0">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={3} />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={3}
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`} className="transition-all duration-700" />
                <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fill="hsl(var(--foreground))" fontSize={size * 0.28} fontWeight="500" fontFamily="var(--font-display)">{score}</text>
            </svg>
        );
    };

    const TrendIcon = ({ trend }: { trend: string }) => {
        if (trend === 'improving') return <ArrowUpRight className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />;
        if (trend === 'declining') return <ArrowDownRight className="h-3.5 w-3.5 text-destructive" strokeWidth={1.5} />;
        return <Minus className="h-3.5 w-3.5 text-foreground-soft" strokeWidth={1.5} />;
    };

    const SeverityDot = ({ severity }: { severity: string }) => (
        <div className={cn(
            'w-2 h-2 rounded-full shrink-0',
            severity === 'critical' ? 'bg-destructive' :
                severity === 'warning' ? 'bg-warning' : 'bg-foreground-soft'
        )} />
    );

    if (loading) {
        return (
            <div className="bg-card border border-border p-6 flex items-center justify-center py-16">
                <div className="text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto mb-3" strokeWidth={1.5} />
                    <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">Analyzing intelligence…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Brain className="h-4 w-4 text-primary" strokeWidth={1.5} />
                    <h3 className="font-display text-base font-medium tracking-tight text-foreground">AI intelligence</h3>
                    {anomalies && anomalies.critical > 0 && (
                        <span className="font-mono text-2xs uppercase tracking-widest px-2 py-0.5 bg-destructive/10 text-destructive border border-destructive/20">
                            {anomalies.critical} critical
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={days}
                        onChange={e => setDays(Number(e.target.value))}
                        className="font-mono text-2xs uppercase tracking-widest px-2 py-1.5 bg-background-2 border border-border text-foreground-soft focus:outline-none focus:ring-1 focus:ring-foreground/30"
                    >
                        <option value={7}>7 days</option>
                        <option value={14}>14 days</option>
                        <option value={30}>30 days</option>
                        <option value={90}>90 days</option>
                    </select>
                    <button onClick={fetchAll} className="p-1.5 border border-border bg-card text-foreground-soft hover:text-foreground transition-colors">
                        <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* View Tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-border">
                {[
                    { id: 'summary', label: 'Summary', icon: FileText },
                    { id: 'scores', label: 'Scores', icon: Target },
                    { id: 'anomalies', label: `Anomalies${anomalies?.total ? ` (${anomalies.total})` : ''}`, icon: AlertTriangle },
                    { id: 'benchmarks', label: 'Benchmarks', icon: BarChart3 },
                ].map(v => (
                    <button
                        key={v.id}
                        onClick={() => setActiveView(v.id as any)}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-2 font-mono text-2xs uppercase tracking-widest transition-colors whitespace-nowrap border-b -mb-px',
                            activeView === v.id
                                ? 'text-primary border-primary'
                                : 'text-foreground-soft border-transparent hover:text-foreground'
                        )}
                    >
                        <v.icon className="h-3 w-3" strokeWidth={1.5} /> {v.label}
                    </button>
                ))}
            </div>

            {/* Summary View */}
            {activeView === 'summary' && summary && (
                <div className="space-y-4">
                    <div className="bg-card border border-border p-5">
                        <p className="font-display text-base font-medium tracking-tight text-foreground mb-2">{summary.headline}</p>
                        <p className="font-serif text-sm text-foreground-soft leading-relaxed">{summary.executiveSummary}</p>
                    </div>

                    {summary.recommendations.length > 0 && (
                        <div className="border border-primary/20 bg-primary/5 p-5">
                            <p className="font-mono text-2xs uppercase tracking-widest text-primary mb-3">Recommendations</p>
                            <ul className="space-y-2">
                                {summary.recommendations.map((r, i) => (
                                    <li key={i} className="flex items-start gap-2 font-serif text-sm text-foreground">
                                        <Zap className="h-3.5 w-3.5 text-primary shrink-0 mt-1" strokeWidth={1.5} />
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {summary.anomalies.length > 0 && (
                        <div className="space-y-2">
                            {summary.anomalies.map((a, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-card border border-border">
                                    <SeverityDot severity={a.severity} />
                                    <span className="font-serif text-sm text-foreground-soft">{a.message}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeView === 'summary' && !summary && (
                <div className="text-center py-12 border border-border bg-card">
                    <Brain className="h-8 w-8 text-foreground-soft mx-auto mb-3" strokeWidth={1.5} />
                    <p className="font-serif text-sm text-foreground-soft">No data available yet. Sync integrations to generate insights.</p>
                </div>
            )}

            {/* Scores View */}
            {activeView === 'scores' && (
                <div className="space-y-2">
                    {scores.length === 0 ? (
                        <div className="text-center py-12 border border-border bg-card">
                            <Target className="h-8 w-8 text-foreground-soft mx-auto mb-3" strokeWidth={1.5} />
                            <p className="font-serif text-sm text-foreground-soft">No campaigns with metric data to score.</p>
                        </div>
                    ) : scores.map(s => (
                        <div key={s.campaignId} className="flex items-center gap-4 p-4 bg-card border border-border hover:bg-foreground/[0.02] transition-colors">
                            <ScoreRing score={s.overallScore} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-display text-base font-medium tracking-tight text-foreground truncate">{s.campaignName}</p>
                                    <TrendIcon trend={s.trend} />
                                </div>
                                <p className="font-serif text-xs text-foreground-soft truncate">{s.insights[0]}</p>
                                <div className="flex gap-4 mt-2">
                                    {[
                                        { label: 'Efficiency', val: s.efficiencyScore },
                                        { label: 'Growth', val: s.growthScore },
                                        { label: 'Engagement', val: s.engagementScore },
                                        { label: 'Spend', val: s.spendScore },
                                    ].map(sub => (
                                        <div key={sub.label} className="font-mono text-2xs uppercase tracking-widest">
                                            <span className="text-foreground-soft">{sub.label}</span>
                                            <span className={cn(
                                                'ml-1.5',
                                                sub.val >= 60 ? 'text-success' : sub.val >= 35 ? 'text-warning' : 'text-destructive'
                                            )}>
                                                {sub.val}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Anomalies View */}
            {activeView === 'anomalies' && (
                <div className="space-y-2">
                    {!anomalies || anomalies.anomalies.length === 0 ? (
                        <div className="text-center py-12 border border-border bg-card">
                            <CheckCircle className="h-8 w-8 text-success mx-auto mb-3" strokeWidth={1.5} />
                            <p className="font-serif text-sm text-success">No anomalies detected. All metrics within normal range.</p>
                        </div>
                    ) : anomalies.anomalies.map(a => (
                        <div key={a.id} className={cn(
                            'flex items-start gap-3 p-4 border',
                            a.severity === 'critical' ? 'border-destructive/30 bg-destructive/5' :
                                a.severity === 'warning' ? 'border-warning/30 bg-warning/5' :
                                    'border-border bg-card'
                        )}>
                            <SeverityDot severity={a.severity} />
                            <div className="flex-1 min-w-0">
                                <p className="font-serif text-sm text-foreground">{a.message}</p>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">{a.metric}</span>
                                    <span className={cn(
                                        'font-mono text-2xs uppercase tracking-widest',
                                        a.deviationPct > 0 ? 'text-destructive' : 'text-warning'
                                    )}>
                                        {a.deviationPct > 0 ? '+' : ''}{a.deviationPct.toFixed(0)}%
                                    </span>
                                    <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">{new Date(a.detectedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Benchmarks View */}
            {activeView === 'benchmarks' && (
                <div className="space-y-3">
                    {!benchmarks ? (
                        <div className="text-center py-12 border border-border bg-card">
                            <BarChart3 className="h-8 w-8 text-foreground-soft mx-auto mb-3" strokeWidth={1.5} />
                            <p className="font-serif text-sm text-foreground-soft">No benchmark data available.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between p-4 bg-card border border-border">
                                <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">Overall rating</span>
                                <span className={cn(
                                    'font-display text-base font-medium tracking-tight',
                                    benchmarks.overallRating === 'Excellent' ? 'text-success' :
                                        benchmarks.overallRating === 'Good' ? 'text-primary' :
                                            benchmarks.overallRating === 'Average' ? 'text-warning' : 'text-destructive'
                                )}>
                                    {benchmarks.overallRating}
                                </span>
                            </div>
                            {benchmarks.comparisons.map(c => {
                                const ratingColor =
                                    c.rating === 'excellent' ? 'text-success' :
                                        c.rating === 'good' ? 'text-primary' :
                                            c.rating === 'average' ? 'text-warning' :
                                                c.rating === 'below' ? 'text-warning' :
                                                    c.rating === 'poor' ? 'text-destructive' :
                                                        'text-foreground-soft';
                                return (
                                    <div key={c.metric} className="bg-card border border-border p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-display text-base font-medium tracking-tight text-foreground">{c.label}</span>
                                            <span className={cn('font-mono text-2xs uppercase tracking-widest', ratingColor)}>{c.rating}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="text-center p-2 border border-border">
                                                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">You</p>
                                                <p className="font-display text-base font-medium text-foreground mt-1">{c.brandValue.toFixed(2)}</p>
                                            </div>
                                            <div className="text-center p-2 border border-border">
                                                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">Industry</p>
                                                <p className="font-display text-base font-medium text-foreground-soft mt-1">{c.industryAvg.toFixed(2)}</p>
                                            </div>
                                            <div className="text-center p-2 border border-border">
                                                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">vs Previous</p>
                                                <p className={cn(
                                                    'font-display text-base font-medium mt-1',
                                                    c.vsPrevious > 0 ? 'text-success' : c.vsPrevious < -5 ? 'text-destructive' : 'text-foreground-soft'
                                                )}>
                                                    {c.vsPrevious > 0 ? '+' : ''}{c.vsPrevious.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
