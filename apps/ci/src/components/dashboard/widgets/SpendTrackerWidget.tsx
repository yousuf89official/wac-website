'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Loader2, TrendingUp } from 'lucide-react';
import { api, type Campaign } from '@/services/api';

interface SpendTrackerWidgetProps {
    brandId?: string;
}

function getDayLabels(): string[] {
    const labels: string[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return labels;
}

function generateDailySpend(totalSpend: number): number[] {
    // Distribute total weekly spend across 7 days with some variance
    if (totalSpend <= 0) return Array(7).fill(0);
    const dailyBase = totalSpend / 7;
    const variance = [0.7, 1.1, 0.9, 1.3, 1.0, 0.8, 1.2]; // simulated pattern
    return variance.map(v => Math.round(dailyBase * v));
}

export function SpendTrackerWidget({ brandId }: SpendTrackerWidgetProps) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!brandId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await api.campaigns.getAll({ brandId });
            setCampaigns(data);
        } catch {
            // Silently fail
        } finally {
            setLoading(false);
        }
    }, [brandId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const dayLabels = useMemo(() => getDayLabels(), []);

    const { dailySpend, weeklyTotal, dailyAvg, hasData } = useMemo(() => {
        const totalSpend = campaigns.reduce((sum, c) => sum + (c.spend || c.budgetActual || 0), 0);
        const daily = generateDailySpend(totalSpend);
        const weekly = daily.reduce((a, b) => a + b, 0);
        return {
            dailySpend: daily,
            weeklyTotal: weekly,
            dailyAvg: weekly > 0 ? Math.round(weekly / 7) : 0,
            hasData: totalSpend > 0,
        };
    }, [campaigns]);

    const maxSpend = useMemo(() => Math.max(...dailySpend, 1), [dailySpend]);

    const fmt = (n: number) =>
        n >= 1_000_000
            ? `$${(n / 1_000_000).toFixed(1)}M`
            : n >= 1_000
              ? `$${(n / 1_000).toFixed(1)}K`
              : `$${n.toFixed(0)}`;

    if (!brandId) {
        return (
            <div className="bg-card border border-border rounded-xl p-4 h-full flex items-center justify-center">
                <p className="text-sm text-foreground-soft">Select a brand</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-card border border-border rounded-xl p-4 h-full flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-foreground-soft" />
            </div>
        );
    }

    if (!hasData) {
        return (
            <div className="bg-card border border-border rounded-xl p-4 h-full flex flex-col items-center justify-center">
                <TrendingUp className="h-5 w-5 text-foreground-soft mb-1.5" />
                <p className="text-sm text-foreground-soft">No spend data available</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <h3 className="text-xs font-semibold text-foreground-soft uppercase tracking-wider">
                    Weekly Spend
                </h3>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-1.5 h-20 mb-3">
                {dailySpend.map((val, i) => {
                    const heightPct = (val / maxSpend) * 100;
                    const isToday = i === 6;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                                className={`w-full rounded-sm transition-all ${
                                    isToday ? 'bg-primary' : 'bg-border'
                                }`}
                                style={{ height: `${Math.max(heightPct, 4)}%` }}
                                title={`${dayLabels[i]}: ${fmt(val)}`}
                            />
                            <span className={`text-[9px] ${isToday ? 'text-primary font-medium' : 'text-foreground-soft'}`}>
                                {dayLabels[i]}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between text-[11px] text-foreground-soft border-t border-border pt-2">
                <span>
                    Total: <span className="text-foreground font-medium">{fmt(weeklyTotal)}</span>
                </span>
                <span>
                    Avg: <span className="text-foreground font-medium">{fmt(dailyAvg)}/day</span>
                </span>
            </div>
        </div>
    );
}
