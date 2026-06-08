'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    BarChart3, TrendingUp, TrendingDown, Loader2, AlertCircle,
    ChevronDown, Lightbulb, Target, DollarSign, MousePointer,
    Eye, Users
} from 'lucide-react';
import { toast } from 'sonner';

interface Brand {
    id: string;
    name: string;
}

interface BenchmarkComparison {
    metric: string;
    label: string;
    brandValue: number;
    industryAvg: number;
    platformAvg: number;
    previousPeriod: number;
    vsIndustry: number;
    vsPlatform: number;
    vsPrevious: number;
    rating: 'excellent' | 'good' | 'average' | 'below' | 'poor';
}

interface BenchmarkReport {
    brandId: string;
    brandName: string;
    period: string;
    comparisons: BenchmarkComparison[];
    overallRating: string;
    industryBenchmarkSource: string;
}

// Map metrics to icons and formatting
const METRIC_CONFIG: Record<string, { icon: typeof BarChart3; format: (v: number) => string; higherIsBetter: boolean }> = {
    ctr: { icon: MousePointer, format: (v) => `${v.toFixed(2)}%`, higherIsBetter: true },
    cpc: { icon: DollarSign, format: (v) => `$${v.toFixed(2)}`, higherIsBetter: false },
    cpm: { icon: Eye, format: (v) => `$${v.toFixed(2)}`, higherIsBetter: false },
    engagementRate: { icon: Users, format: (v) => `${v.toFixed(2)}%`, higherIsBetter: true },
};

const RATING_COLORS: Record<string, string> = {
    excellent: 'text-success bg-success/10 border-success/20',
    good: 'text-primary bg-primary/10 border-primary/20',
    average: 'text-warning bg-warning/10 border-warning/20',
    below: 'text-warning bg-warning/10 border-warning/20',
    poor: 'text-destructive bg-destructive/10 border-destructive/20',
};

function generateRecommendations(comparisons: BenchmarkComparison[]): { title: string; message: string }[] {
    const recs: { title: string; message: string }[] = [];

    for (const c of comparisons) {
        const config = METRIC_CONFIG[c.metric];
        if (!config) continue;

        const diff = Math.abs(c.vsIndustry).toFixed(1);

        if (c.metric === 'ctr' && c.vsIndustry < -5) {
            recs.push({
                title: 'Improve Click-Through Rate',
                message: `Your CTR is ${diff}% below industry average. Consider testing new ad creatives, refining audience targeting, or A/B testing headlines and CTAs.`,
            });
        } else if (c.metric === 'cpc' && c.vsIndustry < -5) {
            recs.push({
                title: 'Reduce Cost Per Click',
                message: `Your CPC is ${diff}% above average. Review keyword targeting, pause underperforming ads, and optimize quality scores to lower costs.`,
            });
        } else if (c.metric === 'cpm' && c.vsIndustry < -5) {
            recs.push({
                title: 'Optimize CPM Efficiency',
                message: `Your CPM is ${diff}% above industry average. Consider adjusting bid strategies, refining audience segments, or exploring more cost-effective placements.`,
            });
        } else if (c.metric === 'engagementRate' && c.vsIndustry < -5) {
            recs.push({
                title: 'Boost Engagement Rate',
                message: `Your engagement rate is ${diff}% below industry average. Focus on creating more interactive content, using video formats, and engaging with comments.`,
            });
        }
    }

    // If doing well across the board
    if (recs.length === 0) {
        const aboveAvg = comparisons.filter(c => c.vsIndustry > 0);
        if (aboveAvg.length >= comparisons.length / 2) {
            recs.push({
                title: 'Strong Performance',
                message: 'Your brand is performing at or above industry benchmarks across most metrics. Maintain current strategies and consider scaling high-performing campaigns.',
            });
        } else {
            recs.push({
                title: 'Review Campaign Strategy',
                message: 'Performance is mixed across metrics. Consider a deeper audit of individual campaigns to identify what is working and what needs adjustment.',
            });
        }
    }

    return recs.slice(0, 3);
}

export default function BenchmarksPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [selectedBrandId, setSelectedBrandId] = useState<string>('');
    const [report, setReport] = useState<BenchmarkReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [brandsLoading, setBrandsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Fetch brands on mount
    useEffect(() => {
        async function fetchBrands() {
            try {
                const res = await fetch('/api/brands');
                if (!res.ok) throw new Error('Failed to fetch brands');
                const data = await res.json();
                setBrands(data);
            } catch (err) {
                toast.error('Failed to load brands');
            } finally {
                setBrandsLoading(false);
            }
        }
        fetchBrands();
    }, []);

    // Fetch benchmarks when brand selected
    const fetchBenchmarks = useCallback(async (brandId: string) => {
        if (!brandId) return;
        setLoading(true);
        setError(null);
        setReport(null);

        try {
            const res = await fetch(`/api/intelligence/benchmarks?brandId=${brandId}`);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to fetch benchmarks');
            }
            const data: BenchmarkReport = await res.json();
            setReport(data);
        } catch (err: any) {
            console.error('Benchmark fetch error:', err);
            setError(err.message || 'Benchmark data unavailable. Ensure campaign data is synced.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedBrandId) {
            fetchBenchmarks(selectedBrandId);
        }
    }, [selectedBrandId, fetchBenchmarks]);

    const selectedBrand = brands.find(b => b.id === selectedBrandId);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · Benchmarks
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    Industry Benchmarks
                </h1>
                <p className="mt-4 text-foreground-soft max-w-2xl">
                    Compare your brand&apos;s performance against industry averages.
                </p>
                <div className="mt-6">
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-medium text-foreground hover:bg-card transition-all min-w-[200px] justify-between"
                        >
                            <span className={selectedBrand ? 'text-foreground' : 'text-foreground-soft'}>
                                {brandsLoading ? 'Loading...' : selectedBrand ? selectedBrand.name : 'Select a brand'}
                            </span>
                            <ChevronDown className={`h-4 w-4 text-foreground-soft transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {dropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-full min-w-[240px] max-h-60 overflow-y-auto rounded-xl bg-card border border-border shadow-2xl shadow-background-2/30 z-20 ">
                                    {brands.length === 0 ? (
                                        <p className="px-4 py-3 text-xs text-foreground-soft">No brands found</p>
                                    ) : (
                                        brands.map(brand => (
                                            <button
                                                key={brand.id}
                                                onClick={() => {
                                                    setSelectedBrandId(brand.id);
                                                    setDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-card ${
                                                    brand.id === selectedBrandId
                                                        ? 'text-primary font-bold bg-primary/5'
                                                        : 'text-foreground-soft'
                                                }`}
                                            >
                                                {brand.name}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Empty State — No Brand Selected */}
            {!selectedBrandId && !loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="p-4 rounded-2xl bg-card border border-border mb-4">
                        <Target className="h-8 w-8 text-foreground-soft" />
                    </div>
                    <p className="text-sm font-medium text-foreground-soft">Select a brand to see benchmarks</p>
                    <p className="text-xs text-foreground-soft mt-1">Choose a brand from the dropdown above to compare against industry averages</p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="p-6 rounded-2xl border border-border bg-card animate-pulse">
                                <div className="h-4 w-32 bg-card rounded mb-4" />
                                <div className="flex gap-8">
                                    <div className="space-y-2 flex-1">
                                        <div className="h-3 w-20 bg-card rounded" />
                                        <div className="h-8 w-24 bg-card rounded" />
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <div className="h-3 w-20 bg-card rounded" />
                                        <div className="h-8 w-24 bg-card rounded" />
                                    </div>
                                </div>
                                <div className="mt-4 h-3 bg-card rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 mb-4">
                        <AlertCircle className="h-8 w-8 text-destructive/60" />
                    </div>
                    <p className="text-sm font-medium text-foreground-soft">Benchmark data unavailable</p>
                    <p className="text-xs text-foreground-soft mt-1">Ensure campaign data is synced and try again.</p>
                    <button
                        onClick={() => fetchBenchmarks(selectedBrandId)}
                        className="mt-4 px-4 py-2 rounded-lg bg-card border border-border text-xs font-bold text-foreground-soft hover:text-foreground hover:bg-card transition-all"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Benchmark Results */}
            {report && !loading && (
                <>
                    {/* Overall Rating Badge */}
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                            RATING_COLORS[report.overallRating.toLowerCase()] || RATING_COLORS.average
                        }`}>
                            {report.overallRating}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">{report.brandName} — {report.period}</p>
                            <p className="text-[10px] text-foreground-soft mt-0.5">Source: {report.industryBenchmarkSource}</p>
                        </div>
                    </div>

                    {/* Metric Comparison Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.comparisons.map(comp => {
                            const config = METRIC_CONFIG[comp.metric] || { icon: BarChart3, format: (v: number) => v.toFixed(2), higherIsBetter: true };
                            const Icon = config.icon;
                            const isPositive = comp.vsIndustry > 0;
                            const absDiff = Math.abs(comp.vsIndustry).toFixed(1);

                            return (
                                <div
                                    key={comp.metric}
                                    className="p-6 rounded-2xl border border-border bg-card"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-lg bg-card">
                                                <Icon className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-sm font-bold text-foreground">{comp.label}</span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold border capitalize ${RATING_COLORS[comp.rating]}`}>
                                            {comp.rating}
                                        </span>
                                    </div>

                                    {/* Values Side by Side */}
                                    <div className="flex gap-6 mb-4">
                                        <div className="flex-1">
                                            <p className="text-[10px] text-foreground-soft uppercase tracking-wider mb-1">Your Brand</p>
                                            <p className="text-xl font-bold text-foreground">{config.format(comp.brandValue)}</p>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-foreground-soft uppercase tracking-wider mb-1">Industry Avg</p>
                                            <p className="text-xl font-bold text-foreground-soft">{config.format(comp.industryAvg)}</p>
                                        </div>
                                    </div>

                                    {/* Delta Indicator */}
                                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border">
                                        {isPositive ? (
                                            <TrendingUp className="h-4 w-4 text-success shrink-0" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-destructive shrink-0" />
                                        )}
                                        <span className={`text-xs font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                                            {isPositive ? '+' : '-'}{absDiff}% vs industry
                                        </span>
                                        {comp.vsPrevious !== 0 && (
                                            <span className="text-[10px] text-foreground-soft ml-auto">
                                                {comp.vsPrevious > 0 ? '+' : ''}{comp.vsPrevious.toFixed(1)}% vs prev period
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Performance Comparison Bars */}
                    <div className="p-6 rounded-2xl border border-border bg-card">
                        <h3 className="text-sm font-bold text-foreground mb-6">Performance Comparison</h3>
                        <div className="space-y-6">
                            {report.comparisons.map(comp => {
                                const config = METRIC_CONFIG[comp.metric] || { format: (v: number) => v.toFixed(2), higherIsBetter: true };
                                const maxVal = Math.max(comp.brandValue, comp.industryAvg, 0.01);
                                const brandPct = (comp.brandValue / maxVal) * 100;
                                const industryPct = (comp.industryAvg / maxVal) * 100;

                                return (
                                    <div key={comp.metric}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-foreground-soft">{comp.label}</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {/* Brand Bar */}
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-foreground-soft w-16 shrink-0">Your brand</span>
                                                <div className="flex-1 h-5 bg-card rounded overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded transition-all duration-700"
                                                        style={{ width: `${Math.max(brandPct, 2)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-foreground w-16 text-right">{config.format(comp.brandValue)}</span>
                                            </div>
                                            {/* Industry Bar */}
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-foreground-soft w-16 shrink-0">Industry</span>
                                                <div className="flex-1 h-5 bg-card rounded overflow-hidden">
                                                    <div
                                                        className="h-full bg-card rounded transition-all duration-700"
                                                        style={{ width: `${Math.max(industryPct, 2)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-foreground-soft w-16 text-right">{config.format(comp.industryAvg)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-gradient-to-r from-primary to-primary/60" />
                                <span className="text-[10px] text-foreground-soft">Your Brand</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-card" />
                                <span className="text-[10px] text-foreground-soft">Industry Average</span>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    {(() => {
                        const recommendations = generateRecommendations(report.comparisons);
                        return recommendations.length > 0 ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Lightbulb className="h-4 w-4 text-primary" />
                                    <h3 className="text-sm font-bold text-foreground">Recommendations</h3>
                                </div>
                                {recommendations.map((rec, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 rounded-xl bg-card border-l-2 border-l-primary border border-border"
                                    >
                                        <p className="text-xs font-bold text-foreground mb-1">{rec.title}</p>
                                        <p className="text-xs text-foreground-soft leading-relaxed">{rec.message}</p>
                                    </div>
                                ))}
                            </div>
                        ) : null;
                    })()}
                </>
            )}
        </div>
    );
}
