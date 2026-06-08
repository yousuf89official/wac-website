'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Bell, Plus, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Alert {
    id: string;
    campaignId: string;
    type: string;
    metric: string;
    operator: string;
    threshold: number;
    isActive: boolean;
    lastTriggeredAt: string | null;
    createdBy: string;
    createdAt: string;
}

interface AlertsPanelProps {
    campaignId: string;
    campaignName?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ALERT_TYPES = [
    { value: 'overpace', label: 'Overpace' },
    { value: 'underpace', label: 'Underpace' },
    { value: 'budget_threshold', label: 'Budget Threshold' },
    { value: 'cpa_spike', label: 'CPA Spike' },
    { value: 'ctr_drop', label: 'CTR Drop' },
] as const;

const METRICS = [
    { value: 'spend', label: 'Spend' },
    { value: 'cpa', label: 'CPA' },
    { value: 'ctr', label: 'CTR' },
    { value: 'roas', label: 'ROAS' },
] as const;

const OPERATORS = [
    { value: 'gt', label: '>', symbol: '>' },
    { value: 'lt', label: '<', symbol: '<' },
    { value: 'gte', label: '>=', symbol: '>=' },
    { value: 'lte', label: '<=', symbol: '<=' },
] as const;

const TYPE_COLORS: Record<string, string> = {
    overpace: 'bg-destructive/10 text-destructive border-destructive/20',
    underpace: 'bg-warning/10 text-warning border-warning/20',
    budget_threshold: 'bg-warning/10 text-warning border-warning/20',
    cpa_spike: 'bg-destructive/10 text-destructive border-destructive/20',
    ctr_drop: 'bg-accent/10 text-accent border-accent/20',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateString: string): string {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;

    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatTypeLabel(type: string): string {
    return ALERT_TYPES.find((t) => t.value === type)?.label ?? type;
}

function formatCondition(metric: string, operator: string, threshold: number): string {
    const op = OPERATORS.find((o) => o.value === operator)?.symbol ?? operator;
    const metricLabel = metric.toUpperCase();
    const isCurrency = metric === 'spend' || metric === 'cpa';
    const formattedValue = isCurrency
        ? `$${threshold.toLocaleString()}`
        : metric === 'ctr'
            ? `${threshold}%`
            : threshold.toLocaleString();
    return `${metricLabel} ${op} ${formattedValue}`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AlertsPanel({ campaignId, campaignName }: AlertsPanelProps) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);

    // Form state
    const [newType, setNewType] = useState('overpace');
    const [newMetric, setNewMetric] = useState('spend');
    const [newOperator, setNewOperator] = useState('gt');
    const [newThreshold, setNewThreshold] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Toggling / deleting in progress
    const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

    // ── Fetch alerts ────────────────────────────────────────────────────────

    const fetchAlerts = useCallback(async () => {
        try {
            const data = await api.campaigns.getAlerts(campaignId);
            setAlerts(data);
        } catch {
            // Silently fail on refresh
        }
    }, [campaignId]);

    useEffect(() => {
        let active = true;

        async function loadInitial() {
            try {
                const data = await api.campaigns.getAlerts(campaignId);
                if (active) {
                    setAlerts(data);
                }
            } catch {
                if (active) {
                    toast.error('Failed to load alerts');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadInitial();

        return () => {
            active = false;
        };
    }, [campaignId, fetchAlerts]);

    // ── Add alert ───────────────────────────────────────────────────────────

    async function handleAddAlert(e: React.FormEvent) {
        e.preventDefault();
        const threshold = parseFloat(newThreshold);
        if (isNaN(threshold) || threshold <= 0) {
            toast.error('Enter a valid positive threshold');
            return;
        }
        if (submitting) return;

        setSubmitting(true);
        try {
            const created = await api.campaigns.addAlert(campaignId, {
                type: newType,
                metric: newMetric,
                operator: newOperator,
                threshold,
            });
            setAlerts((prev) => [created, ...prev]);
            setNewThreshold('');
            setFormOpen(false);
            toast.success('Alert created');
        } catch {
            toast.error('Failed to create alert');
        } finally {
            setSubmitting(false);
        }
    }

    // ── Toggle alert ────────────────────────────────────────────────────────

    async function handleToggle(alertId: string, currentActive: boolean) {
        setTogglingIds((prev) => new Set(prev).add(alertId));
        // Optimistic update
        setAlerts((prev) =>
            prev.map((a) => (a.id === alertId ? { ...a, isActive: !currentActive } : a))
        );

        try {
            await api.campaigns.toggleAlert(campaignId, alertId, !currentActive);
            toast.success(`Alert ${!currentActive ? 'enabled' : 'disabled'}`);
        } catch {
            // Revert on failure
            setAlerts((prev) =>
                prev.map((a) => (a.id === alertId ? { ...a, isActive: currentActive } : a))
            );
            toast.error('Failed to toggle alert');
        } finally {
            setTogglingIds((prev) => {
                const next = new Set(prev);
                next.delete(alertId);
                return next;
            });
        }
    }

    // ── Delete alert ────────────────────────────────────────────────────────

    async function handleDelete(alertId: string) {
        setDeletingIds((prev) => new Set(prev).add(alertId));
        try {
            await api.campaigns.deleteAlert(campaignId, alertId);
            setAlerts((prev) => prev.filter((a) => a.id !== alertId));
            toast.success('Alert deleted');
        } catch {
            toast.error('Failed to delete alert');
        } finally {
            setDeletingIds((prev) => {
                const next = new Set(prev);
                next.delete(alertId);
                return next;
            });
        }
    }

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col rounded-xl border border-border bg-card">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Bell className="h-4 w-4 text-foreground-soft" />
                <span className="text-sm font-medium text-foreground">Spend Alerts</span>
                {!loading && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-card border border-border px-1.5 text-xs text-foreground-soft">
                        {alerts.length}
                    </span>
                )}
                {campaignName && (
                    <span className="ml-auto truncate text-xs text-foreground-soft/60" title={campaignName}>
                        {campaignName}
                    </span>
                )}
            </div>

            {/* Create Alert Form (collapsible) */}
            <div className="border-b border-border">
                <button
                    type="button"
                    onClick={() => setFormOpen((v) => !v)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-primary transition hover:bg-card/60"
                >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Alert</span>
                    {formOpen ? (
                        <ChevronUp className="ml-auto h-3.5 w-3.5 text-foreground-soft/60" />
                    ) : (
                        <ChevronDown className="ml-auto h-3.5 w-3.5 text-foreground-soft/60" />
                    )}
                </button>

                {formOpen && (
                    <form onSubmit={handleAddAlert} className="flex flex-col gap-3 px-4 pb-4">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Type */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-foreground-soft">Type</label>
                                <Select value={newType} onValueChange={setNewType}>
                                    <SelectTrigger className="h-9 border-border bg-card text-sm text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ALERT_TYPES.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Metric */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-foreground-soft">Metric</label>
                                <Select value={newMetric} onValueChange={setNewMetric}>
                                    <SelectTrigger className="h-9 border-border bg-card text-sm text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {METRICS.map((m) => (
                                            <SelectItem key={m.value} value={m.value}>
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Operator */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-foreground-soft">Operator</label>
                                <Select value={newOperator} onValueChange={setNewOperator}>
                                    <SelectTrigger className="h-9 border-border bg-card text-sm text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {OPERATORS.map((o) => (
                                            <SelectItem key={o.value} value={o.value}>
                                                {o.symbol}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Threshold */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-foreground-soft">Threshold</label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder="e.g. 10000"
                                    value={newThreshold}
                                    onChange={(e) => setNewThreshold(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="sm"
                            disabled={submitting || !newThreshold}
                            className="self-end"
                        >
                            {submitting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                'Add Alert'
                            )}
                        </Button>
                    </form>
                )}
            </div>

            {/* Alert List */}
            <div className="max-h-[420px] overflow-y-auto px-4 py-3">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-foreground-soft/60" />
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="py-8 text-center text-sm text-foreground-soft/60">
                        No alerts configured. Add your first alert to monitor this campaign.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="flex items-center gap-3 rounded-lg bg-card border border-border p-4"
                            >
                                {/* Left: type badge + condition */}
                                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            className={`text-[10px] px-2 py-0.5 border ${TYPE_COLORS[alert.type] ?? 'bg-card text-foreground-soft border-border'}`}
                                        >
                                            {formatTypeLabel(alert.type)}
                                        </Badge>
                                        {alert.lastTriggeredAt ? (
                                            <span className="text-[10px] text-foreground-soft/60">
                                                Triggered {timeAgo(alert.lastTriggeredAt)}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-foreground-soft/60">Never triggered</span>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-foreground-soft">
                                        {formatCondition(alert.metric, alert.operator, alert.threshold)}
                                    </span>
                                </div>

                                {/* Right: toggle + delete */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {/* Active toggle */}
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={alert.isActive}
                                        aria-label={`${alert.isActive ? 'Disable' : 'Enable'} alert`}
                                        disabled={togglingIds.has(alert.id)}
                                        onClick={() => handleToggle(alert.id, alert.isActive)}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 ${
                                            alert.isActive
                                                ? 'bg-primary'
                                                : 'bg-card border border-border'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-foreground shadow-sm transition-transform duration-200 ${
                                                alert.isActive ? 'translate-x-[18px]' : 'translate-x-[3px]'
                                            }`}
                                        />
                                    </button>

                                    {/* Delete */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={deletingIds.has(alert.id)}
                                        onClick={() => handleDelete(alert.id)}
                                        className="h-8 w-8 text-foreground-soft/60 hover:text-destructive"
                                        aria-label="Delete alert"
                                    >
                                        {deletingIds.has(alert.id) ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
