'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PacingData {
    campaign: string;
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    daysTotal: number;
    daysElapsed: number;
    daysRemaining: number;
    dailyRunRate: number;
    idealDailySpend: number;
    projectedTotalSpend: number;
    paceStatus: 'on_track' | 'overpacing' | 'underpacing' | 'no_data';
    pacePercentage: number;
    budgetUtilization: number;
    projectedOverUnder: number;
}

interface BudgetPacingWidgetProps {
    campaignId: string;
    compact?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value);

const STATUS_CONFIG = {
    on_track: {
        label: 'On Track',
        bar: 'bg-success',
        dot: 'bg-success',
        badge: 'text-success bg-success/10 border-success/30',
    },
    overpacing: {
        label: 'Overpacing',
        bar: 'bg-destructive',
        dot: 'bg-destructive',
        badge: 'text-destructive bg-destructive/10 border-destructive/30',
    },
    underpacing: {
        label: 'Underpacing',
        bar: 'bg-warning',
        dot: 'bg-warning',
        badge: 'text-warning bg-warning/10 border-warning/30',
    },
    no_data: {
        label: 'No Data',
        bar: 'bg-foreground-soft',
        dot: 'bg-foreground-soft',
        badge: 'text-foreground-soft bg-card border-border',
    },
} as const;

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status, large }: { status: PacingData['paceStatus']; large?: boolean }) {
    const config = STATUS_CONFIG[status];
    return (
        <span
            className={`inline-flex items-center font-medium rounded-full border ${large ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs'} ${config.badge}`}
        >
            <span
                className={`rounded-full ${large ? 'w-2 h-2 mr-2' : 'w-1.5 h-1.5 mr-1.5'} ${config.dot}`}
            />
            {config.label}
        </span>
    );
}

function ProgressBar({
    utilization,
    status,
    idealPercent,
    spentLabel,
    budgetLabel,
    mini,
}: {
    utilization: number;
    status: PacingData['paceStatus'];
    idealPercent?: number;
    spentLabel?: string;
    budgetLabel?: string;
    mini?: boolean;
}) {
    const barClass = STATUS_CONFIG[status].bar;
    const clampedUtilization = Math.min(utilization, 100);

    return (
        <div className="w-full">
            <div className={`relative w-full rounded-full overflow-hidden bg-card border border-border ${mini ? 'h-1.5' : 'h-3'}`}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                    style={{ width: `${clampedUtilization}%` }}
                />
                {idealPercent != null && !mini && (
                    <div
                        className="absolute top-0 h-full w-0.5 bg-foreground/50"
                        style={{ left: `${Math.min(idealPercent, 100)}%` }}
                        title={`Ideal: ${idealPercent.toFixed(0)}%`}
                    />
                )}
            </div>
            {!mini && spentLabel && budgetLabel && (
                <div className="flex justify-between mt-1.5 text-xs text-foreground-soft">
                    <span>{spentLabel} spent</span>
                    <span>{budgetLabel} budget</span>
                </div>
            )}
        </div>
    );
}

function MetricCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg px-4 py-3 bg-card border border-border">
            <p className="text-xs text-foreground-soft mb-1">{label}</p>
            <p className="text-sm font-semibold text-foreground">{value}</p>
        </div>
    );
}

// ─── Loading State ──────────────────────────────────────────────────────────

function LoadingSkeleton({ compact }: { compact?: boolean }) {
    if (compact) {
        return (
            <div className="rounded-xl p-4 animate-pulse bg-card border border-border">
                <div className="h-4 w-24 rounded bg-card mb-3" />
                <div className="h-1.5 w-full rounded bg-card" />
            </div>
        );
    }

    return (
        <div className="rounded-xl p-6 animate-pulse bg-card border border-border">
            <div className="h-6 w-32 rounded bg-card mb-4" />
            <div className="h-3 w-full rounded bg-card mb-6" />
            <div className="grid grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-lg bg-card" />
                ))}
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function BudgetPacingWidget({ campaignId, compact = false }: BudgetPacingWidgetProps) {
    const [data, setData] = useState<PacingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setError(false);

        api.campaigns.getPacing(campaignId)
            .then((result: PacingData) => {
                if (!cancelled) {
                    setData(result);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError(true);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => { cancelled = true; };
    }, [campaignId]);

    // Loading
    if (loading) {
        return <LoadingSkeleton compact={compact} />;
    }

    // Error / No Data
    if (error || !data || data.paceStatus === 'no_data') {
        return (
            <div className="rounded-xl p-6 text-center bg-card border border-border">
                <p className="text-sm text-foreground-soft">No pacing data available</p>
            </div>
        );
    }

    // ── Compact View ────────────────────────────────────────────────────────

    if (compact) {
        return (
            <div className="rounded-xl p-4 bg-card border border-border">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-foreground truncate mr-2">{data.campaign}</p>
                    <StatusBadge status={data.paceStatus} />
                </div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-foreground-soft">Utilization</span>
                    <span className="text-xs font-medium text-foreground-soft">{data.budgetUtilization.toFixed(0)}%</span>
                </div>
                <ProgressBar
                    utilization={data.budgetUtilization}
                    status={data.paceStatus}
                    mini
                />
            </div>
        );
    }

    // ── Full View ───────────────────────────────────────────────────────────

    const idealPercent = data.daysTotal > 0 ? (data.daysElapsed / data.daysTotal) * 100 : 0;
    const isOver = data.paceStatus === 'overpacing';

    return (
        <div className="rounded-xl p-6 bg-card border border-border">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-foreground">Budget Pacing</h3>
                <StatusBadge status={data.paceStatus} large />
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <ProgressBar
                    utilization={data.budgetUtilization}
                    status={data.paceStatus}
                    idealPercent={idealPercent}
                    spentLabel={formatCurrency(data.totalSpent)}
                    budgetLabel={formatCurrency(data.totalBudget)}
                />
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <MetricCard label="Daily Run Rate" value={`${formatCurrency(data.dailyRunRate)}/day`} />
                <MetricCard label="Ideal Daily Spend" value={`${formatCurrency(data.idealDailySpend)}/day`} />
                <MetricCard label="Projected Total" value={formatCurrency(data.projectedTotalSpend)} />
                <MetricCard label="Days Remaining" value={`${data.daysRemaining} days`} />
            </div>

            {/* Projected Over/Under */}
            {data.projectedOverUnder !== 0 && (
                <div
                    className={`rounded-lg px-4 py-3 text-sm border ${
                        isOver
                            ? 'bg-destructive/10 border-destructive/20 text-destructive'
                            : 'bg-warning/10 border-warning/20 text-warning'
                    }`}
                >
                    {data.projectedOverUnder > 0
                        ? `Projected to overspend by ${formatCurrency(data.projectedOverUnder)}`
                        : `Projected to underspend by ${formatCurrency(Math.abs(data.projectedOverUnder))}`}
                </div>
            )}
        </div>
    );
}
