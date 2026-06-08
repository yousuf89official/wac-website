'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, type Campaign, type Channel } from '@/services/api';
import CommentThread from '@/components/campaigns/CommentThread';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    FileText, ArrowLeft, Copy, Trash2, RefreshCw,
    Layers, DollarSign, Zap, MessageSquare, Bell,
    Calendar, Building2, TrendingUp, TrendingDown, Minus,
    ExternalLink, ChevronRight, ToggleLeft, ToggleRight,
    Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ── Types ──────────────────────────────────────────────────────────────────────

interface PacingData {
    paceStatus: 'on_track' | 'overpacing' | 'underpacing';
    percentSpent: number;
    percentElapsed: number;
    dailyRunRate: number;
    projectedTotal: number;
    budgetPlanned: number;
    budgetActual: number;
    daysRemaining: number;
}

interface BudgetAllocation {
    id: string;
    channelId?: string;
    channelName?: string;
    amount: number;
    period?: string;
    label?: string;
    createdAt?: string;
}

interface CampaignRule {
    id: string;
    name: string;
    description?: string;
    condition: string;
    action: string;
    isActive: boolean;
    frequency: string;
    lastTriggeredAt: string | null;
}

interface CampaignAlert {
    id: string;
    type: string;
    metric: string;
    threshold: number;
    isActive: boolean;
    message?: string;
    createdAt?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatCurrency(value: number | undefined): string {
    if (!value) return '-';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
        case 'active': return 'border-success bg-success text-success';
        case 'paused': return 'border-warning bg-warning text-warning';
        case 'completed': return 'border-border bg-card text-foreground/70';
        case 'draft': return 'border-border bg-card text-foreground/50';
        default: return 'border-border bg-card text-foreground/50';
    }
}

function getApprovalColor(status: string): string {
    switch (status?.toLowerCase()) {
        case 'approved': return 'border-success bg-success text-success';
        case 'pending': return 'border-warning bg-warning text-warning';
        case 'rejected': return 'border-destructive bg-destructive text-destructive';
        default: return 'border-border bg-card text-foreground/50';
    }
}

function getPaceColor(status: string): string {
    switch (status) {
        case 'on_track': return '#10b981';
        case 'overpacing': return '#ef4444';
        case 'underpacing': return '#f59e0b';
        default: return '#6b7280';
    }
}

function getPaceLabel(status: string): string {
    switch (status) {
        case 'on_track': return 'On Track';
        case 'overpacing': return 'Overpacing';
        case 'underpacing': return 'Underpacing';
        default: return 'Unknown';
    }
}

function humanCondition(condJson: string): string {
    try {
        const c = JSON.parse(condJson);
        const ops: Record<string, string> = { gt: '>', lt: '<', gte: '>=', lte: '<=', eq: '=' };
        return `${c.metric} ${ops[c.operator] || c.operator} ${c.value} over ${c.window}`;
    } catch { return condJson; }
}

function humanAction(actJson: string): string {
    try {
        const a = JSON.parse(actJson);
        const labels: Record<string, string> = {
            pause_campaign: 'Pause Campaign',
            activate_campaign: 'Activate Campaign',
            send_alert: 'Send Alert',
            adjust_budget: 'Adjust Budget',
        };
        return labels[a.type] || a.type;
    } catch { return actJson; }
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function CampaignDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    // Core data
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [subCampaigns, setSubCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    // Tab data
    const [pacing, setPacing] = useState<PacingData | null>(null);
    const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
    const [rules, setRules] = useState<CampaignRule[]>([]);
    const [alerts, setAlerts] = useState<CampaignAlert[]>([]);

    // Tab loading states
    const [pacingLoading, setPacingLoading] = useState(false);
    const [rulesLoading, setRulesLoading] = useState(false);
    const [alertsLoading, setAlertsLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('overview');

    // ── Core Data Fetch ────────────────────────────────────────────────────────

    const fetchCampaign = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [campaignData, channelData] = await Promise.all([
                api.campaigns.getById(id),
                api.campaigns.getChannels(id).catch(() => []),
            ]);
            setCampaign(campaignData);
            setChannels(channelData);

            // Fetch sub-campaigns if this is a parent
            if (!campaignData.parentId) {
                try {
                    const subs = await api.subCampaigns.getByParent(id);
                    setSubCampaigns(subs);
                } catch { setSubCampaigns([]); }
            }
        } catch {
            toast.error('Failed to load campaign');
            router.push('/admin/brand-campaign-settings');
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => { fetchCampaign(); }, [fetchCampaign]);

    // ── Tab Data Fetchers ──────────────────────────────────────────────────────

    const fetchBudgetData = useCallback(async () => {
        if (!id) return;
        setPacingLoading(true);
        try {
            const [pacingData, budgetData] = await Promise.all([
                api.campaigns.getPacing(id).catch(() => null),
                api.campaigns.getBudget(id).catch(() => []),
            ]);
            setPacing(pacingData);
            setAllocations(budgetData);
        } finally { setPacingLoading(false); }
    }, [id]);

    const fetchRules = useCallback(async () => {
        if (!id) return;
        setRulesLoading(true);
        try {
            setRules(await api.campaignRules.getAll(id));
        } catch { setRules([]); }
        finally { setRulesLoading(false); }
    }, [id]);

    const fetchAlerts = useCallback(async () => {
        if (!id) return;
        setAlertsLoading(true);
        try {
            setAlerts(await api.campaigns.getAlerts(id));
        } catch { setAlerts([]); }
        finally { setAlertsLoading(false); }
    }, [id]);

    // Fetch tab data on tab change
    useEffect(() => {
        if (activeTab === 'budget') fetchBudgetData();
        if (activeTab === 'rules') fetchRules();
        if (activeTab === 'alerts') fetchAlerts();
    }, [activeTab, fetchBudgetData, fetchRules, fetchAlerts]);

    // ── Actions ────────────────────────────────────────────────────────────────

    const handleClone = async () => {
        if (!id) return;
        try {
            const cloned = await api.campaigns.clone(id);
            toast.success(`Campaign cloned: ${cloned.name}`);
            router.push(`/admin/campaign-detail/${cloned.id}`);
        } catch { toast.error('Failed to clone campaign'); }
    };

    const handleDelete = async () => {
        if (!id || !campaign) return;
        if (!window.confirm(`Delete campaign "${campaign.name}"? This cannot be undone.`)) return;
        try {
            await api.campaigns.delete(id);
            toast.success('Campaign deleted');
            router.push('/admin/brand-campaign-settings');
        } catch { toast.error('Failed to delete campaign'); }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!id) return;
        try {
            const updated = await api.campaigns.updateStatus(id, newStatus);
            setCampaign(updated);
            toast.success(`Status updated to ${newStatus}`);
        } catch { toast.error('Failed to update status'); }
    };

    const handleToggleAlert = async (alert: CampaignAlert) => {
        if (!id) return;
        try {
            await api.campaigns.toggleAlert(id, alert.id, !alert.isActive);
            setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isActive: !a.isActive } : a));
            toast.success(alert.isActive ? 'Alert disabled' : 'Alert enabled');
        } catch { toast.error('Failed to toggle alert'); }
    };

    // ── Loading State ──────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
                    <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">Loading Campaign...</p>
                </div>
            </div>
        );
    }

    if (!campaign) return null;

    // ── Computed Values ────────────────────────────────────────────────────────

    const budgetPlanned = campaign.budgetPlanned || 0;
    const budgetSpent = campaign.spend || campaign.budgetActual || 0;
    const budgetPercent = budgetPlanned > 0 ? Math.min((budgetSpent / budgetPlanned) * 100, 100) : 0;

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back Button */}
            <button
                onClick={() => router.push('/admin/brand-campaign-settings')}
                className="flex items-center gap-2 text-foreground/40 hover:text-foreground/70 transition-colors text-sm font-medium group"
            >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Campaigns
            </button>

            {/* Page Header */}
                        <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · Campaign Detail
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    {campaign.name}
                </h1>
                <div className="mt-6"><div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClone}
                            className="border-border text-foreground/70 hover:bg-card"
                        >
                            <Copy className="h-3.5 w-3.5 mr-1.5" /> Clone
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-border text-foreground/70 hover:bg-card"
                                >
                                    Status: {campaign.status || 'Draft'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[hsl(var(--card))] border-border">
                                {['draft', 'active', 'paused', 'completed'].map(s => (
                                    <DropdownMenuItem
                                        key={s}
                                        onClick={() => handleStatusChange(s)}
                                        className="text-foreground/70 capitalize"
                                    >
                                        {s}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            className="border-destructive text-destructive hover:bg-destructive hover:border-destructive"
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                        </Button>
                    </div></div>
            </header>

            {/* Status Badges + Key Metrics */}
            <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className={getStatusColor(campaign.status)}>
                    {campaign.status || 'Draft'}
                </Badge>
                {(campaign as any).approvalStatus && (
                    <Badge variant="outline" className={getApprovalColor((campaign as any).approvalStatus)}>
                        {(campaign as any).approvalStatus}
                    </Badge>
                )}
            </div>

            {/* Key Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-[hsl(var(--primary))]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Budget</span>
                    </div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(budgetPlanned)}</div>
                    <div className="text-xs text-foreground/40 mt-1">
                        Spent: {formatCurrency(budgetSpent)} ({budgetPercent.toFixed(0)}%)
                    </div>
                    <Progress value={budgetPercent} className="h-1.5 mt-2 bg-card" />
                </div>

                <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-[hsl(var(--primary))]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Date Range</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground">{formatDate(campaign.startDate)}</div>
                    <div className="text-xs text-foreground/40 mt-0.5">to {formatDate(campaign.endDate)}</div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-[hsl(var(--primary))]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Market</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground">{campaign.marketName || campaign.marketCode || '-'}</div>
                    <div className="text-xs text-foreground/40 mt-0.5">{campaign.objective || 'No objective set'}</div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Layers className="h-4 w-4 text-[hsl(var(--primary))]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Structure</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground">{subCampaigns.length} Sub-campaigns</div>
                    <div className="text-xs text-foreground/40 mt-0.5">{channels.length} Channel{channels.length !== 1 ? 's' : ''} assigned</div>
                </div>
            </div>

            {/* Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-card border border-border rounded-xl p-1 h-auto w-full justify-start gap-1">
                    {[
                        { value: 'overview', label: 'Overview', icon: Layers },
                        { value: 'budget', label: 'Budget', icon: DollarSign },
                        { value: 'rules', label: 'Rules', icon: Zap },
                        { value: 'comments', label: 'Comments', icon: MessageSquare },
                        { value: 'alerts', label: 'Alerts', icon: Bell },
                    ].map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                'text-foreground/50 hover:text-foreground/70 hover:bg-card',
                                'data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--primary))] data-[state=active]:shadow-none'
                            )}
                        >
                            <tab.icon className="h-3.5 w-3.5" />
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* ── Tab 1: Overview ──────────────────────────────────────────── */}
                <TabsContent value="overview" className="mt-6 space-y-6">
                    {/* Description */}
                    {campaign.description && (
                        <div className="bg-card border border-border rounded-xl p-5">
                            <h3 className="text-sm font-bold text-foreground/80 mb-2">Description</h3>
                            <p className="text-sm text-foreground/50 leading-relaxed whitespace-pre-wrap">{campaign.description}</p>
                        </div>
                    )}

                    {/* Sub-campaigns */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <h3 className="text-sm font-bold text-foreground/80 mb-4">
                            Sub-campaigns ({subCampaigns.length})
                        </h3>
                        {subCampaigns.length === 0 ? (
                            <p className="text-sm text-foreground/30 py-4 text-center">No sub-campaigns found.</p>
                        ) : (
                            <div className="space-y-3">
                                {subCampaigns.map(sub => (
                                    <div
                                        key={sub.id}
                                        onClick={() => router.push(`/admin/campaign-detail/${sub.id}`)}
                                        className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:bg-card cursor-pointer transition-colors group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-8 w-8 rounded-lg bg-card flex items-center justify-center shrink-0">
                                                <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate group-hover:text-[hsl(var(--primary))] transition-colors">
                                                    {sub.serviceType || sub.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {sub.marketCode && (
                                                        <span className="text-[10px] text-foreground/40 font-mono">{sub.marketCode}</span>
                                                    )}
                                                    {sub.objective && (
                                                        <span className="text-[10px] text-foreground/30">{sub.objective}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <Badge variant="outline" className={cn('text-xs', getStatusColor(sub.status))}>
                                                {sub.status}
                                            </Badge>
                                            {sub.budgetPlanned && (
                                                <span className="text-xs font-medium text-foreground/50">
                                                    {formatCurrency(sub.budgetPlanned)}
                                                </span>
                                            )}
                                            <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-foreground/40 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Channel Assignments */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <h3 className="text-sm font-bold text-foreground/80 mb-4">
                            Channel Assignments ({channels.length})
                        </h3>
                        {channels.length === 0 ? (
                            <p className="text-sm text-foreground/30 py-4 text-center">No channels assigned.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {channels.map(ch => (
                                    <Badge
                                        key={ch.id}
                                        variant="outline"
                                        className="border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] px-3 py-1"
                                    >
                                        {ch.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Campaign Info */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <h3 className="text-sm font-bold text-foreground/80 mb-4">Campaign Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Service Type', value: campaign.serviceType || '-' },
                                { label: 'Sub-campaign Type', value: campaign.subCampaignType || '-' },
                                { label: 'Objective', value: campaign.objective || '-' },
                                { label: 'Market', value: campaign.marketName || campaign.marketCode || '-' },
                                { label: 'Platform', value: campaign.platform || '-' },
                                { label: 'Parent Campaign', value: campaign.parentCampaign || (campaign.parentId ? 'Yes' : 'None') },
                            ].map(item => (
                                <div key={item.label}>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">{item.label}</p>
                                    <p className="text-sm text-foreground/70">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                {/* ── Tab 2: Budget ────────────────────────────────────────────── */}
                <TabsContent value="budget" className="mt-6 space-y-6">
                    {pacingLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-6 w-6 animate-spin text-foreground/30" />
                        </div>
                    ) : (
                        <>
                            {/* Pacing Widget */}
                            {pacing && (
                                <div className="bg-card border border-border rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-foreground/80">Budget Pacing</h3>
                                        <Badge
                                            variant="outline"
                                            style={{
                                                borderColor: `${getPaceColor(pacing.paceStatus)}40`,
                                                backgroundColor: `${getPaceColor(pacing.paceStatus)}15`,
                                                color: getPaceColor(pacing.paceStatus),
                                            }}
                                        >
                                            {pacing.paceStatus === 'on_track' && <TrendingUp className="h-3 w-3 mr-1" />}
                                            {pacing.paceStatus === 'overpacing' && <TrendingUp className="h-3 w-3 mr-1" />}
                                            {pacing.paceStatus === 'underpacing' && <TrendingDown className="h-3 w-3 mr-1" />}
                                            {getPaceLabel(pacing.paceStatus)}
                                        </Badge>
                                    </div>

                                    {/* Pacing Progress Bar */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs text-foreground/40">
                                            <span>Spent: {formatCurrency(pacing.budgetActual)}</span>
                                            <span>Budget: {formatCurrency(pacing.budgetPlanned)}</span>
                                        </div>
                                        <div className="relative h-4 bg-card rounded-full overflow-hidden">
                                            {/* Time elapsed marker */}
                                            <div
                                                className="absolute top-0 bottom-0 w-px bg-card/30 z-10"
                                                style={{ left: `${Math.min(pacing.percentElapsed, 100)}%` }}
                                            />
                                            {/* Spend bar */}
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${Math.min(pacing.percentSpent, 100)}%`,
                                                    backgroundColor: getPaceColor(pacing.paceStatus),
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-foreground/30">
                                            <span>{pacing.percentSpent?.toFixed(1)}% spent</span>
                                            <span>{pacing.percentElapsed?.toFixed(1)}% time elapsed</span>
                                        </div>
                                    </div>

                                    {/* Pacing Stats */}
                                    <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-border">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Daily Run Rate</p>
                                            <p className="text-sm font-semibold text-foreground">{formatCurrency(pacing.dailyRunRate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Projected Total</p>
                                            <p className="text-sm font-semibold text-foreground">{formatCurrency(pacing.projectedTotal)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Days Remaining</p>
                                            <p className="text-sm font-semibold text-foreground">{pacing.daysRemaining}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!pacing && (
                                <div className="bg-card border border-border rounded-xl p-5 text-center">
                                    <p className="text-sm text-foreground/30 py-4">No pacing data available for this campaign.</p>
                                </div>
                            )}

                            {/* Budget Allocations */}
                            <div className="bg-card border border-border rounded-xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-foreground/80">Budget Allocations</h3>
                                </div>
                                {allocations.length === 0 ? (
                                    <p className="text-sm text-foreground/30 py-4 text-center">No allocations found.</p>
                                ) : (
                                    <div className="overflow-hidden rounded-lg border border-border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-border hover:bg-transparent">
                                                    <TableHead className="text-foreground/50">Channel</TableHead>
                                                    <TableHead className="text-foreground/50">Amount</TableHead>
                                                    <TableHead className="text-foreground/50">Period</TableHead>
                                                    <TableHead className="text-foreground/50">Label</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {allocations.map((alloc) => (
                                                    <TableRow key={alloc.id} className="border-border">
                                                        <TableCell className="text-foreground/70 text-sm">
                                                            {alloc.channelName || alloc.channelId || 'General'}
                                                        </TableCell>
                                                        <TableCell className="text-foreground font-semibold text-sm">
                                                            {formatCurrency(alloc.amount)}
                                                        </TableCell>
                                                        <TableCell className="text-foreground/50 text-sm">
                                                            {alloc.period || '-'}
                                                        </TableCell>
                                                        <TableCell className="text-foreground/50 text-sm">
                                                            {alloc.label || '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </TabsContent>

                {/* ── Tab 3: Rules ─────────────────────────────────────────────── */}
                <TabsContent value="rules" className="mt-6 space-y-6">
                    {rulesLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-6 w-6 animate-spin text-foreground/30" />
                        </div>
                    ) : (
                        <div className="bg-card border border-border rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-foreground/80">
                                    Automation Rules ({rules.length})
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push('/admin/campaign-rules')}
                                    className="border-border text-foreground/70 hover:bg-card"
                                >
                                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                    Manage Rules
                                </Button>
                            </div>

                            {rules.length === 0 ? (
                                <p className="text-sm text-foreground/30 py-4 text-center">No rules configured for this campaign.</p>
                            ) : (
                                <div className="space-y-3">
                                    {rules.map(rule => (
                                        <div
                                            key={rule.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-medium text-foreground">{rule.name}</p>
                                                    <Badge
                                                        variant="outline"
                                                        className={rule.isActive
                                                            ? 'border-success bg-success text-success'
                                                            : 'border-border bg-card text-foreground/40'}
                                                    >
                                                        {rule.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className={rule.frequency === 'hourly'
                                                            ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                                                            : 'border-accent bg-accent text-accent'}
                                                    >
                                                        {rule.frequency}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-foreground/40">
                                                    <span className="font-mono bg-card px-2 py-0.5 rounded">
                                                        {humanCondition(rule.condition)}
                                                    </span>
                                                    <span className="text-foreground/20">&rarr;</span>
                                                    <Badge variant="outline" className="border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-xs">
                                                        {humanAction(rule.action)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                {/* ── Tab 4: Comments ──────────────────────────────────────────── */}
                <TabsContent value="comments" className="mt-6">
                    <CommentThread campaignId={id} campaignName={campaign.name} />
                </TabsContent>

                {/* ── Tab 5: Alerts ────────────────────────────────────────────── */}
                <TabsContent value="alerts" className="mt-6 space-y-6">
                    {alertsLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-6 w-6 animate-spin text-foreground/30" />
                        </div>
                    ) : (
                        <div className="bg-card border border-border rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-foreground/80">
                                    Campaign Alerts ({alerts.length})
                                </h3>
                            </div>

                            {alerts.length === 0 ? (
                                <p className="text-sm text-foreground/30 py-4 text-center">No alerts configured for this campaign.</p>
                            ) : (
                                <div className="space-y-3">
                                    {alerts.map(alert => (
                                        <div
                                            key={alert.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Bell className={cn(
                                                        'h-3.5 w-3.5',
                                                        alert.isActive ? 'text-[hsl(var(--primary))]' : 'text-foreground/20'
                                                    )} />
                                                    <p className="text-sm font-medium text-foreground capitalize">{alert.type}</p>
                                                    <Badge variant="outline" className="border-border text-foreground/50 text-xs">
                                                        {alert.metric}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-foreground/40">
                                                    Threshold: {alert.threshold}
                                                    {alert.message && <span className="ml-2">&mdash; {alert.message}</span>}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleToggleAlert(alert)}
                                                className={cn(
                                                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ml-4',
                                                    alert.isActive ? 'bg-[hsl(var(--primary))]' : 'bg-card/10'
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'inline-block h-4 w-4 transform rounded-full bg-card transition-transform',
                                                        alert.isActive ? 'translate-x-[22px]' : 'translate-x-[3px]'
                                                    )}
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
