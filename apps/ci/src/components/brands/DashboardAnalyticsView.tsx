'use client';

import React, { useMemo, useState } from 'react';
import {
    Activity,
    TrendingUp,
    DollarSign,
    Globe
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CHART_COLORS, CHART_GRID, CHART_AXIS_TICK, CHART_TOOLTIP } from '@/lib/chart-theme';

// Helper for currency formatting
const formatCurrency = (amount: number, currency = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
};

import { Brand, Campaign, Metric, Creative } from '@/lib/brand-constants';

const FinancialCard = ({ label, value, trend, icon: Icon, color }: { label: string, value: string, trend: number, icon: any, color: string }) => (
    <Card className="p-4 border-none shadow-sm group hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-start justify-between">
            <div className="space-y-1">
                <Label className="text-[10px] font-bold tracking-widest text-white/40">{label}</Label>
                <div className="text-xl font-black text-white tracking-tight">{value}</div>
            </div>
            <div
                className="p-2.5 rounded-xl group-hover:scale-110 transition-transform"
                style={{
                    backgroundColor: color.startsWith('var') ? 'var(--brand-primary-light)' : `${color}20`,
                    color: color
                }}
            >
                <Icon className="h-4 w-4" />
            </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 pt-3 border-t border-white/[0.04]">
            <span className={`text-[10px] font-black flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                <TrendingUp className={`h-2.5 w-2.5 ${trend < 0 ? 'rotate-180' : ''}`} />
                {trend >= 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-[10px] font-bold text-white/30">vs prior period</span>
        </div>
    </Card>
);

export const DashboardAnalyticsView = ({
    brand,
    campaigns,
    metrics,
    creatives,
    onExecuteClick,
    isPublic = false
}: {
    brand: Brand,
    campaigns: Campaign[],
    metrics: Metric[],
    creatives: Creative[],
    onExecuteClick?: () => void,
    isPublic?: boolean
}) => {
    const brandCampaigns = campaigns.filter((c: Campaign) => c.brand_id === brand.id);
    const brandMetrics = metrics.filter((m: Metric) => brandCampaigns.some((c: Campaign) => c.id === m.campaign_id));

    const stats = useMemo(() => {
        const totalSpend = brandMetrics.reduce((sum: number, m: any) => sum + (m.spend || 0), 0);
        const totalImpressions = brandMetrics.reduce((sum: number, m: any) => sum + (m.impressions || 0), 0);
        const totalClicks = brandMetrics.reduce((sum: number, m: any) => sum + (m.clicks || 0), 0);
        const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

        // Compute real trends: compare first half vs second half of metrics
        const mid = Math.floor(brandMetrics.length / 2);
        const first = brandMetrics.slice(0, mid);
        const second = brandMetrics.slice(mid);
        const pct = (a: number, b: number) => b > 0 ? Math.round(((a - b) / b) * 1000) / 10 : 0;

        const firstSpend = first.reduce((s: number, m: any) => s + (m.spend || 0), 0);
        const secondSpend = second.reduce((s: number, m: any) => s + (m.spend || 0), 0);
        const firstImp = first.reduce((s: number, m: any) => s + (m.impressions || 0), 0);
        const secondImp = second.reduce((s: number, m: any) => s + (m.impressions || 0), 0);
        const firstClicks = first.reduce((s: number, m: any) => s + (m.clicks || 0), 0);
        const secondClicks = second.reduce((s: number, m: any) => s + (m.clicks || 0), 0);
        const firstCtr = firstImp > 0 ? (firstClicks / firstImp) * 100 : 0;
        const secondCtr = secondImp > 0 ? (secondClicks / secondImp) * 100 : 0;

        return {
            totalSpend, totalImpressions, totalClicks, avgCtr,
            trendSpend: pct(secondSpend, firstSpend),
            trendImpressions: pct(secondImp, firstImp),
            trendClicks: pct(secondClicks, firstClicks),
            trendCtr: pct(secondCtr, firstCtr),
        };
    }, [brandMetrics]);

    // Aggregate by date
    const chartData = useMemo(() => {
        const dailyMap: Record<string, { date: string, impressions: number, clicks: number, spend: number }> = {};
        brandMetrics.forEach((m: any) => {
            const date = m.date;
            if (!dailyMap[date]) dailyMap[date] = { date, impressions: 0, clicks: 0, spend: 0 };
            dailyMap[date].impressions += m.impressions || 0;
            dailyMap[date].clicks += m.clicks || 0;
            dailyMap[date].spend += m.spend || 0;
        });
        return Object.values(dailyMap).sort((a: any, b: any) => a.date.localeCompare(b.date));
    }, [brandMetrics]);

    const [chartDays, setChartDays] = useState(7);
    const visibleChartData = useMemo(() => chartData.slice(-chartDays), [chartData, chartDays]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Global Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FinancialCard
                    label="Total Inventory Spend"
                    value={stats.totalSpend > 1e6 ? `$${(stats.totalSpend / 1e6).toFixed(1)}M` : `$${stats.totalSpend.toLocaleString()}`}
                    trend={stats.trendSpend}
                    icon={DollarSign}
                    color="var(--brand-primary)"
                />
                <FinancialCard
                    label="Global Reach"
                    value={stats.totalImpressions > 1e6 ? (stats.totalImpressions / 1e6).toFixed(1) + 'M' : stats.totalImpressions > 1e3 ? (stats.totalImpressions / 1e3).toFixed(1) + 'K' : String(stats.totalImpressions)}
                    trend={stats.trendImpressions}
                    icon={Globe}
                    color="var(--brand-primary)"
                />
                <FinancialCard
                    label="Consumer Engagement"
                    value={stats.totalClicks > 1e6 ? (stats.totalClicks / 1e6).toFixed(1) + 'M' : stats.totalClicks > 1e3 ? (stats.totalClicks / 1e3).toFixed(1) + 'K' : String(stats.totalClicks)}
                    trend={stats.trendClicks}
                    icon={Activity}
                    color="var(--brand-primary)"
                />
                <FinancialCard
                    label="Conversion Yield"
                    value={stats.avgCtr.toFixed(2) + '%'}
                    trend={stats.trendCtr}
                    icon={TrendingUp}
                    color="var(--brand-primary)"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 border-none shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-1.5 bg-[#0D9488] rounded-full shadow-[0_0_12px_var(--brand-primary)] animate-pulse" />
                                <h2 className="text-[11px] font-black text-white uppercase tracking-widest">Market Performance</h2>
                            </div>
                            <p className="text-xs text-white/40 font-medium">Daily impressions & spend correlation</p>
                        </div>
                        <div className="flex bg-white/[0.06] p-1 rounded-lg">
                            <button
                                onClick={() => setChartDays(7)}
                                className={cn(
                                    "px-3 py-1.5 text-[10px] font-black rounded-md uppercase tracking-wider",
                                    chartDays === 7
                                        ? "bg-white/[0.04] shadow-sm text-[#0D9488]"
                                        : "text-white/40 hover:text-white/60"
                                )}
                            >
                                7 Days
                            </button>
                            <button
                                onClick={() => setChartDays(30)}
                                className={cn(
                                    "px-3 py-1.5 text-[10px] font-black rounded-md uppercase tracking-wider",
                                    chartDays === 30
                                        ? "bg-white/[0.04] shadow-sm text-[#0D9488]"
                                        : "text-white/40 hover:text-white/60"
                                )}
                            >
                                30 Days
                            </button>
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={visibleChartData}>
                                <defs>
                                    <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID.stroke} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ ...CHART_AXIS_TICK, fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ ...CHART_AXIS_TICK, fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip {...CHART_TOOLTIP} />
                                <Area
                                    type="monotone"
                                    dataKey="impressions"
                                    stroke={CHART_COLORS.primary}
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorImp)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-sm flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Top Campaigns</h3>
                        <p className="text-xs text-white/40 font-medium">Efficiency by funnel stage</p>
                    </div>
                    <div className="flex-1 space-y-4">
                        {brandCampaigns.map((c, i) => {
                            const cMetrics = metrics.filter(m => m.campaign_id === c.id);
                            const totalSpend = cMetrics.reduce((sum, m) => sum + m.spend, 0);
                            const maxSpend = Math.max(...brandCampaigns.map(bc => metrics.filter(m => m.campaign_id === bc.id).reduce((sum, m) => sum + m.spend, 0)), 1);
                            const percentage = (totalSpend / maxSpend) * 100;

                            return (
                                <div key={c.id} className="space-y-2 group">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-0.5">
                                            <span className="text-[9px] font-black text-[#0D9488] uppercase tracking-wider">{c.funnel_type}</span>
                                            <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[#0D9488] transition-colors">{c.name}</h4>
                                        </div>
                                        <div className="text-xs font-black text-white">{formatCurrency(totalSpend)}</div>
                                    </div>
                                    <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.06] p-[1px]">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#0D9488] to-violet-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {!isPublic && onExecuteClick && (
                        <Button
                            variant="secondary"
                            className="mt-6 w-full h-11 text-xs font-bold tracking-wider"
                            onClick={onExecuteClick}
                        >
                            VIEW DETAILED AUDIT
                        </Button>
                    )}
                </Card>
            </div>
        </div>
    );
};
