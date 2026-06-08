'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, Trophy, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PlatformMetrics {
    spend: number;
    impressions: number;
    clicks: number;
    reach: number;
    engagement: number;
}

interface AttributionData {
    platforms: Record<string, PlatformMetrics>;
    brands: { id: string; name: string }[];
    unassignedMetrics: number;
    totalMetrics: number;
}

// ─── Platform Config ────────────────────────────────────────────────────────

const PLATFORMS = [
    { key: 'google', label: 'Google Ads', color: '#4285F4', gradient: 'from-[#4285F4]/20 to-[#4285F4]/5' },
    { key: 'meta', label: 'Meta Ads', color: '#1877F2', gradient: 'from-[#1877F2]/20 to-[#1877F2]/5' },
    { key: 'tiktok', label: 'TikTok Ads', color: '#FF0050', gradient: 'from-[#FF0050]/20 to-[#FF0050]/5' },
] as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
}

function fmtCurrency(n: number): string {
    return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function ctr(clicks: number, impressions: number): string {
    if (impressions === 0) return '0.00%';
    return `${((clicks / impressions) * 100).toFixed(2)}%`;
}

function cpc(spend: number, clicks: number): string {
    if (clicks === 0) return '$0.00';
    return `$${(spend / clicks).toFixed(2)}`;
}

function perfScore(clicks: number, spend: number): number {
    if (spend === 0) return 0;
    return Math.round((clicks / spend) * 100) / 100;
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function AttributionPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AttributionData | null>(null);
    const [brandId, setBrandId] = useState<string>('all');
    const [dateRange, setDateRange] = useState<string>('30d');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (brandId !== 'all') params.set('brandId', brandId);
            const res = await fetch(`/api/attribution?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const json: AttributionData = await res.json();
            setData(json);
        } catch {
            toast.error('Failed to load attribution data');
        } finally {
            setLoading(false);
        }
    }, [brandId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Computed totals
    const totals: PlatformMetrics = data
        ? Object.values(data.platforms).reduce(
              (acc, p) => ({
                  spend: acc.spend + p.spend,
                  impressions: acc.impressions + p.impressions,
                  clicks: acc.clicks + p.clicks,
                  reach: acc.reach + p.reach,
                  engagement: acc.engagement + p.engagement,
              }),
              { spend: 0, impressions: 0, clicks: 0, reach: 0, engagement: 0 },
          )
        : { spend: 0, impressions: 0, clicks: 0, reach: 0, engagement: 0 };

    const hasData = data && totals.spend > 0;

    // Performance index rankings
    const rankings = data
        ? PLATFORMS.map((p) => ({
              ...p,
              score: perfScore(data.platforms[p.key]?.clicks ?? 0, data.platforms[p.key]?.spend ?? 0),
              metrics: data.platforms[p.key],
          }))
              .filter((p) => p.metrics && p.metrics.spend > 0)
              .sort((a, b) => b.score - a.score)
        : [];

    // ─── Loading state ──────────────────────────────────────────────────

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-xs text-foreground-soft">Loading cross-channel attribution...</p>
                </div>
            </div>
        );
    }

    // ─── Comparison table rows ──────────────────────────────────────────

    type MetricRow = {
        label: string;
        values: Record<string, string>;
        rawValues: Record<string, number>;
        total: string;
        isCurrency?: boolean;
    };

    const metricRows: MetricRow[] = data
        ? [
              {
                  label: 'Spend',
                  values: Object.fromEntries(PLATFORMS.map((p) => [p.key, fmtCurrency(data.platforms[p.key]?.spend ?? 0)])),
                  rawValues: Object.fromEntries(PLATFORMS.map((p) => [p.key, data.platforms[p.key]?.spend ?? 0])),
                  total: fmtCurrency(totals.spend),
                  isCurrency: true,
              },
              {
                  label: 'Impressions',
                  values: Object.fromEntries(PLATFORMS.map((p) => [p.key, fmt(data.platforms[p.key]?.impressions ?? 0)])),
                  rawValues: Object.fromEntries(PLATFORMS.map((p) => [p.key, data.platforms[p.key]?.impressions ?? 0])),
                  total: fmt(totals.impressions),
              },
              {
                  label: 'Clicks',
                  values: Object.fromEntries(PLATFORMS.map((p) => [p.key, fmt(data.platforms[p.key]?.clicks ?? 0)])),
                  rawValues: Object.fromEntries(PLATFORMS.map((p) => [p.key, data.platforms[p.key]?.clicks ?? 0])),
                  total: fmt(totals.clicks),
              },
              {
                  label: 'CTR',
                  values: Object.fromEntries(PLATFORMS.map((p) => [p.key, ctr(data.platforms[p.key]?.clicks ?? 0, data.platforms[p.key]?.impressions ?? 0)])),
                  rawValues: Object.fromEntries(
                      PLATFORMS.map((p) => {
                          const imp = data.platforms[p.key]?.impressions ?? 0;
                          return [p.key, imp > 0 ? (data.platforms[p.key]?.clicks ?? 0) / imp : 0];
                      }),
                  ),
                  total: ctr(totals.clicks, totals.impressions),
              },
              {
                  label: 'CPC',
                  values: Object.fromEntries(PLATFORMS.map((p) => [p.key, cpc(data.platforms[p.key]?.spend ?? 0, data.platforms[p.key]?.clicks ?? 0)])),
                  rawValues: Object.fromEntries(
                      PLATFORMS.map((p) => {
                          const clicks = data.platforms[p.key]?.clicks ?? 0;
                          // For CPC, lower is better — invert for "best" detection
                          return [p.key, clicks > 0 ? (data.platforms[p.key]?.spend ?? 0) / clicks : Infinity];
                      }),
                  ),
                  total: cpc(totals.spend, totals.clicks),
                  isCurrency: true,
              },
          ]
        : [];

    function bestPlatform(row: MetricRow): string | null {
        const entries = Object.entries(row.rawValues).filter(([, v]) => v > 0 && v !== Infinity);
        if (entries.length === 0) return null;
        // For CPC (lower is better) and Spend (lower is better), pick minimum
        if (row.label === 'CPC') {
            return entries.reduce((best, curr) => (curr[1] < best[1] ? curr : best))[0];
        }
        // For CTR, Clicks, Impressions — higher is better
        return entries.reduce((best, curr) => (curr[1] > best[1] ? curr : best))[0];
    }

    // ─── Render ─────────────────────────────────────────────────────────

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · Attribution
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    Cross-Channel Attribution
                </h1>
                <p className="mt-4 text-foreground-soft max-w-2xl">
                    Compare campaign performance across Google Ads, Meta Ads, and TikTok side-by-side.
                </p>
                <div className="mt-6 flex items-center gap-2">
                    <select
                        value={brandId}
                        onChange={(e) => setBrandId(e.target.value)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-background-2 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="all" className="bg-background-2 text-foreground">All Brands</option>
                        {data?.brands.map((b) => (
                            <option key={b.id} value={b.id} className="bg-background-2 text-foreground">
                                {b.name}
                            </option>
                        ))}
                    </select>

                    {['7d', '30d', '90d'].map((d) => (
                        <button
                            key={d}
                            onClick={() => setDateRange(d)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                dateRange === d
                                    ? 'bg-primary text-foreground shadow-lg shadow-primary/20'
                                    : 'bg-card text-foreground-soft border border-border'
                            }`}
                        >
                            {d}
                        </button>
                    ))}

                    <button
                        onClick={fetchData}
                        className="p-2 rounded-lg hover:bg-card text-foreground-soft hover:text-foreground transition-colors ml-1"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </header>

            {/* No data state */}
            {!hasData && !loading && (
                <div className="p-8 rounded-2xl border border-border bg-card text-center">
                    <AlertTriangle className="h-8 w-8 text-warning/60 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-foreground mb-1">No Attribution Data</h3>
                    <p className="text-xs text-foreground-soft max-w-md mx-auto">
                        Connect your Google Ads, Meta Ads, and TikTok integrations to see cross-channel
                        performance data. Metrics will appear here once campaigns are linked and syncing.
                    </p>
                </div>
            )}

            {hasData && (
                <>
                    {/* ── Platform Summary Cards ─────────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PLATFORMS.map((platform) => {
                            const m = data.platforms[platform.key];
                            if (!m) return null;
                            return (
                                <div
                                    key={platform.key}
                                    className={`p-5 rounded-2xl border border-border bg-gradient-to-br ${platform.gradient}  relative overflow-hidden`}
                                >
                                    {/* Color accent bar */}
                                    <div
                                        className="absolute top-0 left-0 right-0 h-1"
                                        style={{ backgroundColor: platform.color }}
                                    />

                                    <div className="flex items-center gap-2 mb-4">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: platform.color }}
                                        />
                                        <h3 className="text-sm font-bold text-foreground">{platform.label}</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-[10px] text-foreground-soft uppercase tracking-wider">Spend</p>
                                            <p className="text-lg font-bold text-foreground">{fmtCurrency(m.spend)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-foreground-soft uppercase tracking-wider">Impressions</p>
                                            <p className="text-lg font-bold text-foreground">{fmt(m.impressions)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-foreground-soft uppercase tracking-wider">Clicks</p>
                                            <p className="text-lg font-bold text-foreground">{fmt(m.clicks)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-foreground-soft uppercase tracking-wider">CTR</p>
                                            <p className="text-lg font-bold text-foreground">
                                                {ctr(m.clicks, m.impressions)}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[10px] text-foreground-soft uppercase tracking-wider">CPC</p>
                                            <p className="text-lg font-bold text-foreground">{cpc(m.spend, m.clicks)}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Comparison Table ────────────────────────────────────────── */}
                    <div className="p-6 rounded-2xl border border-border bg-card overflow-x-auto">
                        <h3 className="font-bold text-foreground mb-4">Platform Comparison</h3>
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="text-[10px] text-foreground-soft uppercase tracking-wider border-b border-border">
                                    <th className="text-left py-3 px-4">Metric</th>
                                    {PLATFORMS.map((p) => (
                                        <th key={p.key} className="text-right py-3 px-4">
                                            <span className="flex items-center justify-end gap-1.5">
                                                <span
                                                    className="w-2 h-2 rounded-full inline-block"
                                                    style={{ backgroundColor: p.color }}
                                                />
                                                {p.label}
                                            </span>
                                        </th>
                                    ))}
                                    <th className="text-right py-3 px-4">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metricRows.map((row, i) => {
                                    const best = bestPlatform(row);
                                    return (
                                        <tr
                                            key={row.label}
                                            className={`border-b border-border ${
                                                i % 2 === 0 ? 'bg-card' : ''
                                            }`}
                                        >
                                            <td className="py-3 px-4 text-sm font-medium text-foreground-soft">
                                                {row.label}
                                            </td>
                                            {PLATFORMS.map((p) => (
                                                <td
                                                    key={p.key}
                                                    className={`py-3 px-4 text-sm font-bold text-right ${
                                                        best === p.key ? 'text-success' : 'text-foreground'
                                                    }`}
                                                >
                                                    {row.values[p.key]}
                                                </td>
                                            ))}
                                            <td className="py-3 px-4 text-sm font-bold text-foreground-soft text-right">
                                                {row.total}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <p className="text-[10px] text-foreground-soft mt-3">
                            Green values indicate the best performer per metric row.
                        </p>
                    </div>

                    {/* ── Budget Allocation Bar ──────────────────────────────────── */}
                    <div className="p-6 rounded-2xl border border-border bg-card">
                        <h3 className="font-bold text-foreground mb-4">Budget Allocation</h3>
                        {/* Proportional bar */}
                        <div className="flex h-8 rounded-lg overflow-hidden mb-4">
                            {PLATFORMS.map((p) => {
                                const spend = data.platforms[p.key]?.spend ?? 0;
                                const pct = totals.spend > 0 ? (spend / totals.spend) * 100 : 0;
                                if (pct === 0) return null;
                                return (
                                    <div
                                        key={p.key}
                                        className="h-full flex items-center justify-center text-[10px] font-bold text-foreground transition-all"
                                        style={{
                                            width: `${pct}%`,
                                            backgroundColor: p.color,
                                            minWidth: pct > 0 ? '40px' : '0',
                                        }}
                                    >
                                        {pct >= 8 ? `${pct.toFixed(1)}%` : ''}
                                    </div>
                                );
                            })}
                        </div>
                        {/* Legend */}
                        <div className="flex flex-wrap gap-4">
                            {PLATFORMS.map((p) => {
                                const spend = data.platforms[p.key]?.spend ?? 0;
                                const pct = totals.spend > 0 ? (spend / totals.spend) * 100 : 0;
                                return (
                                    <div key={p.key} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-sm"
                                            style={{ backgroundColor: p.color }}
                                        />
                                        <span className="text-xs text-foreground-soft">{p.label}</span>
                                        <span className="text-xs font-bold text-foreground">
                                            {fmtCurrency(spend)} ({pct.toFixed(1)}%)
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Performance Index ──────────────────────────────────────── */}
                    {rankings.length > 0 && (
                        <div className="p-6 rounded-2xl border border-border bg-card">
                            <h3 className="font-bold text-foreground mb-1">Performance Index</h3>
                            <p className="text-[10px] text-foreground-soft mb-4">
                                Score = (Clicks / Spend) x 100 — higher is better
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {rankings.map((r, i) => (
                                    <div
                                        key={r.key}
                                        className={`p-5 rounded-xl border transition-all ${
                                            i === 0
                                                ? 'border-warning/20 bg-warning/5'
                                                : 'border-border bg-card'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{ backgroundColor: r.color }}
                                                />
                                                <span className="text-sm font-bold text-foreground">{r.label}</span>
                                            </div>
                                            {i === 0 && (
                                                <Trophy className="h-4 w-4 text-warning" />
                                            )}
                                        </div>
                                        <p className="text-3xl font-bold text-foreground mb-1">{r.score.toFixed(2)}</p>
                                        <p className="text-[10px] text-foreground-soft">
                                            Rank #{i + 1} of {rankings.length}
                                        </p>
                                        {/* Score bar relative to best */}
                                        {rankings[0].score > 0 && (
                                            <div className="mt-3 h-1.5 bg-card rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${(r.score / rankings[0].score) * 100}%`,
                                                        backgroundColor: r.color,
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
