'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Download,
    TrendingUp,
    Users,
    MousePointer2,
    BarChart3,
    Loader2,
    Brain,
    AlertTriangle,
    Target,
    RefreshCw,
    FileText,
    Mail,
    Clock,
} from 'lucide-react';
import { ReportCard } from '@/components/reports/ReportCard';
import { AnalyticsChart } from '@/components/reports/AnalyticsChart';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ease = [0.16, 1, 0.3, 1] as const;

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [brands, setBrands] = useState<any[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [period, setPeriod] = useState(30);
    const [data, setData] = useState<any>(null);
    const [report, setReport] = useState<any>(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'intelligence' | 'campaigns' | 'export'>('overview');

    // Fetch brands on mount
    useEffect(() => {
        fetch('/api/brands')
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => {
                setBrands(d);
                if (d.length > 0 && !selectedBrand) setSelectedBrand(d[0].id);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch analytics + intelligence when brand/period changes
    const fetchReport = useCallback(async () => {
        if (!selectedBrand) return;
        setReportLoading(true);
        try {
            const [analyticsRes, reportRes] = await Promise.allSettled([
                fetch(`/api/analytics?brandId=${selectedBrand}`),
                fetch(`/api/intelligence/report?brandId=${selectedBrand}&days=${period}`),
            ]);

            if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
                setData(await analyticsRes.value.json());
            }
            if (reportRes.status === 'fulfilled' && reportRes.value.ok) {
                setReport(await reportRes.value.json());
            }
        } catch {
            toast.error('Failed to load report data');
        } finally {
            setReportLoading(false);
        }
    }, [selectedBrand, period]);

    useEffect(() => {
        if (selectedBrand) fetchReport();
    }, [fetchReport, selectedBrand]);

    const selectedBrandName = brands.find((b: any) => b.id === selectedBrand)?.name || 'All';

    // CSV Export
    const handleExportCSV = () => {
        if (!data?.trend?.length) {
            toast.error('No data to export');
            return;
        }
        const headers = ['Date', 'Impressions', 'Clicks', 'Reach', 'Engagement', 'Spend'];
        const rows = [
            headers.join(','),
            ...data.trend.map((r: any) =>
                [r.date, r.impressions, r.clicks, r.reach, r.engagement, r.spend].join(','),
            ),
        ];
        const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ci_report_${selectedBrandName}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('CSV exported');
    };

    // JSON Report Export
    const handleExportJSON = () => {
        if (!report) {
            toast.error('No report data');
            return;
        }
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ci_intelligence_report_${selectedBrandName}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        toast.success('Intelligence report exported');
    };

    const summary = report?.summary;
    const campaigns = report?.campaigns || [];
    const anomalies = report?.anomalies;
    const benchmarks = report?.benchmarks;
    const totalImpressions =
        data?.summary?.totalImpressions ||
        data?.trend?.reduce((a: number, c: any) => a + (c.impressions || 0), 0) ||
        0;
    const totalClicks =
        data?.summary?.totalClicks ||
        data?.trend?.reduce((a: number, c: any) => a + (c.clicks || 0), 0) ||
        0;
    const totalSpend =
        data?.summary?.totalSpend ||
        data?.trend?.reduce((a: number, c: any) => a + (c.spend || 0), 0) ||
        0;
    const totalEngagement = data?.summary?.totalEngagement || 0;
    const ctr =
        data?.summary?.ctr ||
        (totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00');

    if (loading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="animate-pulse font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                    Loading report hub…
                </p>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'intelligence', label: 'AI Intelligence', icon: Brain },
        { id: 'campaigns', label: 'Campaign Scores', icon: Target },
        { id: 'export', label: 'Schedule & Export', icon: Mail },
    ] as const;

    return (
        <div className="space-y-24 pb-24">
            {/* Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease }}
                className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
            >
                <div className="max-w-3xl">
                    <div className="mb-4 flex items-center gap-3">
                        <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            Intelligence
                        </span>
                        <span className="inline-block h-px w-10 bg-foreground-soft" />
                        <span className="font-mono text-2xs uppercase tracking-widest text-primary">
                            Reports
                        </span>
                    </div>
                    <h1 className="font-display text-[clamp(2.5rem,5vw,3.75rem)] font-medium leading-[0.96] tracking-tightest text-foreground">
                        Performance <span className="italic text-primary">reports</span>.
                    </h1>
                    <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-foreground-soft">
                        AI-powered reporting across every brand, campaign and platform —
                        the room at a glance, then the room in detail.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:shrink-0">
                    <button
                        onClick={fetchReport}
                        className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                        <RefreshCw className={cn('h-3.5 w-3.5', reportLoading && 'animate-spin')} />
                        Refresh
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                        <Download className="h-3.5 w-3.5" /> CSV
                    </button>
                    <button
                        onClick={handleExportJSON}
                        className="inline-flex items-center gap-2 bg-foreground px-5 py-2 font-mono text-2xs uppercase tracking-widest text-background transition-colors hover:bg-primary"
                    >
                        <FileText className="h-3.5 w-3.5" /> Full report
                    </button>
                </div>
            </motion.section>

            {/* Brand & Period Selector */}
            <motion.section
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, ease }}
                className="grid grid-cols-1 gap-x-12 gap-y-6 border-y border-foreground/15 py-8 md:grid-cols-2"
            >
                <div>
                    <label className="mb-3 block font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        Brand
                    </label>
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="w-full border-b border-border bg-transparent py-2 font-display text-xl text-foreground transition-colors focus:border-primary focus:outline-none"
                    >
                        <option value="" className="bg-background text-foreground">
                            Select brand
                        </option>
                        {brands.map((b: any) => (
                            <option key={b.id} value={b.id} className="bg-background text-foreground">
                                {b.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="mb-3 block font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        Window
                    </label>
                    <div className="flex gap-6 border-b border-border py-2">
                        {[7, 14, 30, 90].map((d) => (
                            <button
                                key={d}
                                onClick={() => setPeriod(d)}
                                className={cn(
                                    'font-mono text-2xs uppercase tracking-widest transition-colors',
                                    period === d
                                        ? 'text-primary'
                                        : 'text-foreground-soft hover:text-foreground',
                                )}
                            >
                                {d} days
                            </button>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, ease }}
                className="-mt-12 flex flex-wrap gap-8 border-b border-foreground/15 pb-1"
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            'group inline-flex items-center gap-2 border-b-2 pb-3 font-mono text-2xs uppercase tracking-widest transition-colors',
                            activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-foreground-soft hover:text-foreground',
                        )}
                    >
                        <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                    </button>
                ))}
            </motion.div>

            {reportLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
            )}

            {/* Overview */}
            {!reportLoading && activeTab === 'overview' && (
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.7, ease }}
                    className="space-y-16"
                >
                    {/* Metric Cards */}
                    <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
                        <ReportCard
                            title="Total Impressions"
                            value={totalImpressions}
                            change={0}
                            icon={TrendingUp}
                            description="Across all campaigns."
                        />
                        <ReportCard
                            title="Total Clicks"
                            value={totalClicks}
                            change={0}
                            icon={MousePointer2}
                            description={`CTR: ${ctr}%`}
                        />
                        <ReportCard
                            title="Engagement"
                            value={totalEngagement}
                            change={0}
                            icon={Users}
                            description="Likes, shares, comments."
                        />
                        <ReportCard
                            title="Media Spend"
                            value={`$${totalSpend.toLocaleString()}`}
                            change={0}
                            icon={BarChart3}
                            description="Total investment."
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="border border-border bg-card p-6 lg:col-span-2">
                            <p className="mb-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                Trend
                            </p>
                            <h3 className="mb-6 font-display text-2xl font-medium tracking-tight text-foreground">
                                Performance over time
                            </h3>
                            <div className="h-[300px]">
                                {data?.trend && (
                                    <AnalyticsChart data={data.trend} type="area" dataKey="impressions" />
                                )}
                            </div>
                        </div>
                        <div className="border border-border bg-card p-6">
                            <p className="mb-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                Spend
                            </p>
                            <h3 className="mb-6 font-display text-2xl font-medium tracking-tight text-foreground">
                                Distribution
                            </h3>
                            <div className="h-[300px]">
                                {data?.trend && (
                                    <AnalyticsChart
                                        data={data.trend.slice(-14)}
                                        type="bar"
                                        dataKey="spend"
                                        color="#0D9488" // brand color — kept
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>
            )}

            {/* Intelligence */}
            {!reportLoading && activeTab === 'intelligence' && (
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.7, ease }}
                    className="space-y-12"
                >
                    {summary ? (
                        <>
                            <div className="border-t border-foreground/15 pt-8">
                                <div className="mb-4 flex items-center gap-3">
                                    <Brain className="h-3.5 w-3.5 text-primary" />
                                    <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                        Executive summary
                                    </span>
                                </div>
                                <p className="font-display text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
                                    {summary.headline}
                                </p>
                                <p className="mt-4 max-w-3xl font-serif text-base leading-relaxed text-foreground-soft">
                                    {summary.executiveSummary}
                                </p>
                            </div>

                            {/* Recommendations */}
                            {summary.recommendations?.length > 0 && (
                                <div>
                                    <p className="mb-6 font-mono text-2xs uppercase tracking-widest text-primary">
                                        Recommendations
                                    </p>
                                    <ul className="divide-y divide-foreground/10 border-y border-foreground/15">
                                        {summary.recommendations.map((r: string, i: number) => (
                                            <li
                                                key={i}
                                                className="grid grid-cols-12 items-baseline gap-4 py-5"
                                            >
                                                <span className="col-span-1 font-mono text-2xs uppercase tracking-widest text-primary">
                                                    {String(i + 1).padStart(2, '0')}
                                                </span>
                                                <p className="col-span-11 font-serif text-base leading-relaxed text-foreground">
                                                    {r}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Anomalies */}
                            {anomalies && anomalies.total > 0 && (
                                <div>
                                    <div className="mb-6 flex items-center gap-3">
                                        <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                                        <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                            {anomalies.total} anomalies detected
                                        </span>
                                        {anomalies.critical > 0 && (
                                            <span className="font-mono text-2xs uppercase tracking-widest text-destructive">
                                                · {anomalies.critical} critical
                                            </span>
                                        )}
                                    </div>
                                    <ul className="divide-y divide-foreground/10 border-y border-foreground/15">
                                        {anomalies.items.map((a: any, i: number) => (
                                            <li
                                                key={i}
                                                className="grid grid-cols-12 items-baseline gap-4 py-5"
                                            >
                                                <span
                                                    className={cn(
                                                        'col-span-2 font-mono text-2xs uppercase tracking-widest md:col-span-1',
                                                        a.severity === 'critical' && 'text-destructive',
                                                        a.severity === 'warning' && 'text-warning',
                                                        a.severity !== 'critical' &&
                                                            a.severity !== 'warning' &&
                                                            'text-foreground-soft',
                                                    )}
                                                >
                                                    {a.severity}
                                                </span>
                                                <div className="col-span-10 md:col-span-11">
                                                    <p className="font-serif text-base leading-relaxed text-foreground">
                                                        {a.message}
                                                    </p>
                                                    <p className="mt-1 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                        {a.campaign} · {a.metric} ·{' '}
                                                        {a.deviation > 0 ? '+' : ''}
                                                        {a.deviation?.toFixed(0)}%
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Benchmarks */}
                            {benchmarks && (
                                <div>
                                    <div className="mb-6 flex items-end justify-between gap-4">
                                        <div>
                                            <p className="mb-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                Competitive
                                            </p>
                                            <h3 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
                                                Benchmarks
                                            </h3>
                                        </div>
                                        <span
                                            className={cn(
                                                'font-mono text-2xs uppercase tracking-widest',
                                                benchmarks.overallRating === 'Excellent' && 'text-success',
                                                benchmarks.overallRating === 'Good' && 'text-primary',
                                                benchmarks.overallRating !== 'Excellent' &&
                                                    benchmarks.overallRating !== 'Good' &&
                                                    'text-warning',
                                            )}
                                        >
                                            {benchmarks.overallRating}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                                        {benchmarks.comparisons.map((c: any) => (
                                            <div
                                                key={c.metric}
                                                className="border-t border-foreground/15 pt-5"
                                            >
                                                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                    {c.metric}
                                                </p>
                                                <p className="mt-2 font-display text-3xl font-medium leading-none tracking-tight text-foreground">
                                                    {typeof c.you === 'number' ? c.you.toFixed(2) : c.you}
                                                </p>
                                                <p className="mt-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                    Industry:{' '}
                                                    {typeof c.industry === 'number'
                                                        ? c.industry.toFixed(2)
                                                        : c.industry}
                                                </p>
                                                <p
                                                    className={cn(
                                                        'mt-1 font-mono text-2xs uppercase tracking-widest',
                                                        c.vsIndustry > 0 && 'text-success',
                                                        c.vsIndustry < -10 && 'text-destructive',
                                                        c.vsIndustry <= 0 &&
                                                            c.vsIndustry >= -10 &&
                                                            'text-foreground-soft',
                                                    )}
                                                >
                                                    {c.vsIndustry > 0 ? '+' : ''}
                                                    {c.vsIndustry?.toFixed(1)}% vs industry
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="border-t border-foreground/15 py-20 text-center">
                            <Brain className="mx-auto mb-4 h-10 w-10 text-foreground-soft/40" />
                            <p className="font-serif text-base text-foreground-soft">
                                No intelligence data available.
                            </p>
                            <p className="mt-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft/60">
                                Select a brand and ensure metric data exists.
                            </p>
                        </div>
                    )}
                </motion.section>
            )}

            {/* Campaigns */}
            {!reportLoading && activeTab === 'campaigns' && (
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.7, ease }}
                >
                    {campaigns.length === 0 ? (
                        <div className="border-t border-foreground/15 py-20 text-center">
                            <Target className="mx-auto mb-4 h-10 w-10 text-foreground-soft/40" />
                            <p className="font-serif text-base text-foreground-soft">
                                No campaign scores available.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-foreground/10 border-y border-foreground/15">
                            {campaigns.map((c: any) => (
                                <li
                                    key={c.id}
                                    className="group grid grid-cols-12 items-center gap-4 py-6 transition-colors hover:bg-foreground/[0.03]"
                                >
                                    {/* Score Ring */}
                                    <div className="col-span-2 md:col-span-1">
                                        <svg width={56} height={56}>
                                            <circle
                                                cx={28}
                                                cy={28}
                                                r={24}
                                                fill="none"
                                                stroke="currentColor"
                                                className="text-foreground/10"
                                                strokeWidth={2}
                                            />
                                            <circle
                                                cx={28}
                                                cy={28}
                                                r={24}
                                                fill="none"
                                                className={cn(
                                                    c.overallScore >= 70 && 'text-success',
                                                    c.overallScore >= 40 &&
                                                        c.overallScore < 70 &&
                                                        'text-warning',
                                                    c.overallScore < 40 && 'text-destructive',
                                                )}
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                strokeDasharray={2 * Math.PI * 24}
                                                strokeDashoffset={
                                                    2 * Math.PI * 24 * (1 - c.overallScore / 100)
                                                }
                                                strokeLinecap="round"
                                                transform="rotate(-90 28 28)"
                                            />
                                            <text
                                                x="50%"
                                                y="50%"
                                                textAnchor="middle"
                                                dy="0.35em"
                                                className="fill-foreground font-display"
                                                fontSize={14}
                                                fontWeight={500}
                                            >
                                                {c.overallScore}
                                            </text>
                                        </svg>
                                    </div>
                                    <div className="col-span-10 min-w-0 md:col-span-7">
                                        <div className="mb-1 flex items-center gap-3">
                                            <p className="truncate font-display text-lg font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
                                                {c.name}
                                            </p>
                                            <span
                                                className={cn(
                                                    'font-mono text-2xs uppercase tracking-widest',
                                                    c.trend === 'improving' && 'text-success',
                                                    c.trend === 'declining' && 'text-destructive',
                                                    c.trend !== 'improving' &&
                                                        c.trend !== 'declining' &&
                                                        'text-foreground-soft',
                                                )}
                                            >
                                                {c.trend}
                                            </span>
                                        </div>
                                        <p className="truncate font-serif text-sm leading-snug text-foreground-soft">
                                            {c.insights?.[0]}
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                                            {[
                                                { l: 'Efficiency', v: c.scores?.efficiency },
                                                { l: 'Growth', v: c.scores?.growth },
                                                { l: 'Engagement', v: c.scores?.engagement },
                                                { l: 'Spend', v: c.scores?.spend },
                                            ].map((s) => (
                                                <div
                                                    key={s.l}
                                                    className="font-mono text-2xs uppercase tracking-widest text-foreground-soft"
                                                >
                                                    {s.l}{' '}
                                                    <span
                                                        className={cn(
                                                            'ml-1',
                                                            (s.v || 0) >= 60 && 'text-success',
                                                            (s.v || 0) >= 35 &&
                                                                (s.v || 0) < 60 &&
                                                                'text-warning',
                                                            (s.v || 0) < 35 && 'text-destructive',
                                                        )}
                                                    >
                                                        {s.v || 0}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-span-12 text-right md:col-span-4">
                                        <p className="font-display text-base text-foreground">
                                            {(c.metrics?.totalImpressions || 0).toLocaleString()} imp
                                        </p>
                                        <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                            ${(c.metrics?.totalSpend || 0).toLocaleString()} spend
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </motion.section>
            )}

            {/* Export */}
            {!reportLoading && activeTab === 'export' && (
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.7, ease }}
                    className="grid grid-cols-1 gap-12 md:grid-cols-2"
                >
                    {/* Manual Export */}
                    <div>
                        <p className="mb-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            Manual
                        </p>
                        <h3 className="mb-6 font-display text-2xl font-medium tracking-tight text-foreground">
                            Export options
                        </h3>
                        <ul className="divide-y divide-foreground/10 border-y border-foreground/15">
                            <li>
                                <button
                                    onClick={handleExportCSV}
                                    className="group flex w-full items-start gap-4 py-5 text-left transition-colors hover:bg-foreground/[0.03]"
                                >
                                    <Download className="mt-1 h-4 w-4 shrink-0 text-foreground-soft transition-colors group-hover:text-primary" />
                                    <div>
                                        <p className="font-display text-base font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
                                            Export as CSV
                                        </p>
                                        <p className="mt-1 font-serif text-sm leading-snug text-foreground-soft">
                                            Raw metric data for spreadsheet analysis.
                                        </p>
                                    </div>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={handleExportJSON}
                                    className="group flex w-full items-start gap-4 py-5 text-left transition-colors hover:bg-foreground/[0.03]"
                                >
                                    <FileText className="mt-1 h-4 w-4 shrink-0 text-foreground-soft transition-colors group-hover:text-primary" />
                                    <div>
                                        <p className="font-display text-base font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
                                            Export intelligence report (JSON)
                                        </p>
                                        <p className="mt-1 font-serif text-sm leading-snug text-foreground-soft">
                                            Full AI analysis with scores, anomalies, benchmarks.
                                        </p>
                                    </div>
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Scheduled Reports */}
                    <div>
                        <p className="mb-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            Automated
                        </p>
                        <h3 className="mb-6 font-display text-2xl font-medium tracking-tight text-foreground">
                            Scheduled reports
                        </h3>
                        <div className="border-y border-foreground/15 py-5">
                            <div className="flex items-start gap-4">
                                <Clock className="mt-1 h-4 w-4 shrink-0 text-primary" />
                                <div>
                                    <p className="font-display text-base font-medium tracking-tight text-foreground">
                                        Email delivery
                                    </p>
                                    <p className="mt-1 font-serif text-sm leading-snug text-foreground-soft">
                                        Daily, weekly or monthly reports delivered to your team and
                                        clients.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <a
                            href="/admin/billing"
                            className="mt-6 inline-flex items-center gap-2 bg-primary px-5 py-2 font-mono text-2xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Manage scheduled reports →
                        </a>
                    </div>
                </motion.section>
            )}
        </div>
    );
}
