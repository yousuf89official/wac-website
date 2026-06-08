'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, type Brand, type Campaign } from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    Building2, ArrowLeft, Loader2, Plus,
    DollarSign, BarChart3, Zap, Link2,
    TrendingUp, ExternalLink, RefreshCw,
    Facebook, FileSpreadsheet, CheckCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { BudgetPacingWidget } from '@/components/campaigns/BudgetPacingWidget';

// ── Types ──────────────────────────────────────────────────────────────────────

interface IntegrationStatus {
    connected: boolean;
    hasPending?: boolean;
    accounts?: Array<{
        id: string;
        customerId: string;
        accountName: string;
        updatedAt: string;
    }>;
}

interface IntelligenceScore {
    overallScore?: number;
    dimensions?: Array<{
        name: string;
        score: number;
    }>;
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
        case 'inactive': return 'border-destructive bg-destructive text-destructive';
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

// ── Main Component ─────────────────────────────────────────────────────────────

export default function BrandDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    // Core data
    const [brand, setBrand] = useState<Brand | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('campaigns');

    // Integrations tab
    const [integrations, setIntegrations] = useState<Record<string, IntegrationStatus>>({});
    const [integrationsLoading, setIntegrationsLoading] = useState(false);

    // Performance tab
    const [intelligenceScore, setIntelligenceScore] = useState<IntelligenceScore | null>(null);
    const [scoreLoading, setScoreLoading] = useState(false);

    // ── Core Data Fetch ────────────────────────────────────────────────────────

    const fetchBrand = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [brandData, campaignData] = await Promise.all([
                api.brands.getById(id),
                api.campaigns.getAll({ brandId: id }),
            ]);
            setBrand(brandData);
            setCampaigns(campaignData);
        } catch {
            toast.error('Failed to load brand');
            router.push('/admin/brand-campaign-settings');
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => { fetchBrand(); }, [fetchBrand]);

    // ── Integration Status Fetch ───────────────────────────────────────────────

    const fetchIntegrations = useCallback(async () => {
        if (!id) return;
        setIntegrationsLoading(true);
        try {
            const [google, meta, tiktok] = await Promise.allSettled([
                api.integrations.googleAds.getStatus(id),
                api.integrations.metaAds.getStatus(id),
                api.integrations.tiktokAds.getStatus(id),
            ]);
            setIntegrations({
                google_ads: google.status === 'fulfilled' ? google.value : { connected: false },
                meta_ads: meta.status === 'fulfilled' ? meta.value : { connected: false },
                tiktok_ads: tiktok.status === 'fulfilled' ? tiktok.value : { connected: false },
            });
        } catch {
            // Silent fail for integrations
        } finally {
            setIntegrationsLoading(false);
        }
    }, [id]);

    // ── Intelligence Score Fetch ───────────────────────────────────────────────

    const fetchIntelligenceScore = useCallback(async () => {
        if (!id) return;
        setScoreLoading(true);
        try {
            const res = await fetch(`/api/intelligence/score?brandId=${id}`);
            if (res.ok) {
                const data = await res.json();
                setIntelligenceScore(data);
            }
        } catch {
            // Silent fail
        } finally {
            setScoreLoading(false);
        }
    }, [id]);

    // Lazy-load tab data
    useEffect(() => {
        if (activeTab === 'integrations' && Object.keys(integrations).length === 0) {
            fetchIntegrations();
        }
        if (activeTab === 'performance' && !intelligenceScore) {
            fetchIntelligenceScore();
        }
    }, [activeTab, integrations, intelligenceScore, fetchIntegrations, fetchIntelligenceScore]);

    // ── Computed Values ────────────────────────────────────────────────────────

    const activeCampaigns = campaigns.filter(c => c.status?.toLowerCase() === 'active');
    const totalBudget = campaigns.reduce((sum, c) => sum + (c.budgetPlanned || 0), 0);
    const totalSpend = campaigns.reduce((sum, c) => sum + (c.spend || 0), 0);

    // ── Loading State ──────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-foreground/30" />
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <p className="text-foreground/50">Brand not found</p>
                <Button variant="outline" onClick={() => router.push('/admin/brand-campaign-settings')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Brands
                </Button>
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/brand-campaign-settings')}
                className="text-foreground/40 hover:text-foreground hover:bg-card -ml-2"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Brands
            </Button>

            {/* Page Header */}
                        <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · Brand Detail
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    {brand.name}
                </h1>
                <div className="mt-6"><Badge className={cn('text-xs font-semibold px-3 py-1', getStatusColor(brand.status || 'active'))}>
                        {brand.status || 'Active'}
                    </Badge></div>
            </header>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Total Campaigns"
                    value={campaigns.length.toString()}
                    icon={<BarChart3 className="h-4 w-4" />}
                />
                <StatCard
                    label="Active Campaigns"
                    value={activeCampaigns.length.toString()}
                    icon={<Zap className="h-4 w-4" />}
                    accent
                />
                <StatCard
                    label="Total Budget"
                    value={formatCurrency(totalBudget)}
                    icon={<DollarSign className="h-4 w-4" />}
                />
                <StatCard
                    label="Total Spend"
                    value={formatCurrency(totalSpend)}
                    icon={<TrendingUp className="h-4 w-4" />}
                />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-card border border-border p-1 rounded-xl">
                    <TabsTrigger
                        value="campaigns"
                        className="data-[state=active]:bg-[hsl(var(--primary))]/20 data-[state=active]:text-[hsl(var(--primary))] data-[state=active]:shadow-none rounded-lg px-4"
                    >
                        Campaigns
                    </TabsTrigger>
                    <TabsTrigger
                        value="integrations"
                        className="data-[state=active]:bg-[hsl(var(--primary))]/20 data-[state=active]:text-[hsl(var(--primary))] data-[state=active]:shadow-none rounded-lg px-4"
                    >
                        Integrations
                    </TabsTrigger>
                    <TabsTrigger
                        value="budget"
                        className="data-[state=active]:bg-[hsl(var(--primary))]/20 data-[state=active]:text-[hsl(var(--primary))] data-[state=active]:shadow-none rounded-lg px-4"
                    >
                        Budget Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="performance"
                        className="data-[state=active]:bg-[hsl(var(--primary))]/20 data-[state=active]:text-[hsl(var(--primary))] data-[state=active]:shadow-none rounded-lg px-4"
                    >
                        Performance
                    </TabsTrigger>
                </TabsList>

                {/* ── Tab 1: Campaigns ──────────────────────────────────────────── */}
                <TabsContent value="campaigns" className="mt-6">
                    <CampaignsTab
                        campaigns={campaigns}
                        brandId={id}
                        onNavigate={(campaignId) => router.push(`/admin/campaign-detail/${campaignId}`)}
                    />
                </TabsContent>

                {/* ── Tab 2: Integrations ───────────────────────────────────────── */}
                <TabsContent value="integrations" className="mt-6">
                    <IntegrationsTab
                        brandId={id}
                        integrations={integrations}
                        loading={integrationsLoading}
                        onRefresh={fetchIntegrations}
                    />
                </TabsContent>

                {/* ── Tab 3: Budget Overview ────────────────────────────────────── */}
                <TabsContent value="budget" className="mt-6">
                    <BudgetTab
                        campaigns={campaigns}
                        totalBudget={totalBudget}
                        totalSpend={totalSpend}
                    />
                </TabsContent>

                {/* ── Tab 4: Performance ────────────────────────────────────────── */}
                <TabsContent value="performance" className="mt-6">
                    <PerformanceTab
                        brandId={id}
                        score={intelligenceScore}
                        loading={scoreLoading}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: boolean }) {
    return (
        <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
                <div className={cn(
                    'h-9 w-9 rounded-lg flex items-center justify-center',
                    accent ? 'bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]' : 'bg-card text-foreground/50'
                )}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-foreground/40 font-medium">{label}</p>
                    <p className={cn('text-lg font-bold', accent ? 'text-[hsl(var(--primary))]' : 'text-foreground')}>
                        {value}
                    </p>
                </div>
            </div>
        </Card>
    );
}

// ── Campaigns Tab ──────────────────────────────────────────────────────────────

function CampaignsTab({ campaigns, brandId, onNavigate }: {
    campaigns: Campaign[];
    brandId: string;
    onNavigate: (id: string) => void;
}) {
    const router = useRouter();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">All Campaigns</h2>
                <Button
                    size="sm"
                    className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80 text-foreground"
                    onClick={() => router.push('/admin/brand-campaign-settings')}
                >
                    <Plus className="h-4 w-4 mr-2" /> New Campaign
                </Button>
            </div>

            {campaigns.length === 0 ? (
                <Card className="p-12 bg-card border-border text-center">
                    <BarChart3 className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                    <p className="text-foreground/40">No campaigns found for this brand.</p>
                    <p className="text-foreground/30 text-sm mt-1">Create a campaign to get started.</p>
                </Card>
            ) : (
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border bg-card hover:bg-card">
                                <TableHead className="text-foreground/50 font-semibold">Campaign</TableHead>
                                <TableHead className="text-foreground/50 font-semibold">Status</TableHead>
                                <TableHead className="text-foreground/50 font-semibold">Approval</TableHead>
                                <TableHead className="text-foreground/50 font-semibold">Budget</TableHead>
                                <TableHead className="text-foreground/50 font-semibold">Spend</TableHead>
                                <TableHead className="text-foreground/50 font-semibold">Dates</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaigns.map((campaign) => (
                                <TableRow
                                    key={campaign.id}
                                    className="border-border hover:bg-card cursor-pointer transition-colors group"
                                    onClick={() => onNavigate(campaign.id)}
                                >
                                    <TableCell className="font-semibold text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">
                                        <div className="flex items-center gap-2">
                                            {campaign.parentId && (
                                                <div className="h-1.5 w-1.5 rounded-full bg-card/30" />
                                            )}
                                            {campaign.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn('text-xs', getStatusColor(campaign.status || 'draft'))}>
                                            {campaign.status || 'Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn('text-xs', getApprovalColor((campaign as any).approvalStatus || 'pending'))}>
                                            {(campaign as any).approvalStatus || 'Pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-foreground/70 font-medium">
                                        {formatCurrency(campaign.budgetPlanned)}
                                    </TableCell>
                                    <TableCell className="text-foreground/70 font-medium">
                                        {formatCurrency(campaign.spend)}
                                    </TableCell>
                                    <TableCell className="text-foreground/50 text-sm">
                                        {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}

// ── Integrations Tab ───────────────────────────────────────────────────────────

const PROVIDERS = [
    {
        key: 'google_ads',
        name: 'Google Ads',
        icon: <span className="font-bold text-lg">G</span>,
        color: 'text-blue-500',
        description: 'Connect Google Ad Accounts',
    },
    {
        key: 'meta_ads',
        name: 'Meta Ads',
        icon: <Facebook className="h-5 w-5" />,
        color: 'text-blue-600',
        description: 'Connect Facebook & Instagram Ad Accounts',
    },
    {
        key: 'tiktok_ads',
        name: 'TikTok Ads',
        icon: <span className="font-bold text-lg">T</span>,
        color: 'text-foreground',
        description: 'Connect TikTok For Business Accounts',
    },
];

function IntegrationsTab({ brandId, integrations, loading, onRefresh }: {
    brandId: string;
    integrations: Record<string, IntegrationStatus>;
    loading: boolean;
    onRefresh: () => void;
}) {
    const handleConnect = async (providerKey: string) => {
        try {
            let url: string;
            if (providerKey === 'google_ads') {
                const res = await api.integrations.googleAds.getAuthUrl(brandId);
                url = res.url;
            } else if (providerKey === 'meta_ads') {
                const res = await api.integrations.metaAds.getAuthUrl(brandId);
                url = res.url;
            } else {
                const res = await api.integrations.tiktokAds.getAuthUrl(brandId);
                url = res.url;
            }
            window.location.href = url;
        } catch {
            toast.error('Failed to initiate connection');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Connected Integrations</h2>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onRefresh}
                    disabled={loading}
                    className="text-foreground/40 hover:text-foreground"
                >
                    <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} /> Refresh
                </Button>
            </div>

            {loading && Object.keys(integrations).length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-foreground/30" />
                </div>
            ) : (
                <div className="grid gap-4">
                    {PROVIDERS.map(provider => {
                        const status = integrations[provider.key];
                        const accounts = status?.accounts || [];
                        const isConnected = accounts.length > 0;

                        return (
                            <Card key={provider.key} className="p-5 bg-card border-border">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            'h-12 w-12 bg-card rounded-lg flex items-center justify-center border border-border',
                                            provider.color
                                        )}>
                                            {provider.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">{provider.name}</h3>
                                            <p className="text-xs text-foreground/50 mb-2">{provider.description}</p>

                                            {isConnected ? (
                                                <div className="space-y-2 mt-2">
                                                    {accounts.map(acc => (
                                                        <div key={acc.id} className="flex items-center gap-2 bg-card px-3 py-1.5 rounded border border-success">
                                                            <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-foreground">{acc.accountName}</span>
                                                                <span className="text-[10px] text-foreground/40 font-mono">ID: {acc.customerId}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="border-border text-foreground/40">
                                                    Not Connected
                                                </Badge>
                                            )}

                                            {status?.hasPending && (
                                                <Badge variant="outline" className="mt-2 bg-warning text-warning border-warning">
                                                    Action Required
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant={isConnected ? 'outline' : 'default'}
                                        className={isConnected ? '' : 'bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80 text-foreground'}
                                        onClick={() => handleConnect(provider.key)}
                                    >
                                        {isConnected ? 'Connect Another' : 'Connect'}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Budget Tab ─────────────────────────────────────────────────────────────────

function BudgetTab({ campaigns, totalBudget, totalSpend }: {
    campaigns: Campaign[];
    totalBudget: number;
    totalSpend: number;
}) {
    const utilizationPercent = totalBudget > 0 ? Math.min((totalSpend / totalBudget) * 100, 100) : 0;
    const activeCampaigns = campaigns.filter(c => c.status?.toLowerCase() === 'active');

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 bg-card border-border">
                    <p className="text-xs text-foreground/40 font-medium mb-1">Total Planned Budget</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(totalBudget)}</p>
                </Card>
                <Card className="p-5 bg-card border-border">
                    <p className="text-xs text-foreground/40 font-medium mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSpend)}</p>
                </Card>
                <Card className="p-5 bg-card border-border">
                    <p className="text-xs text-foreground/40 font-medium mb-1">Budget Utilization</p>
                    <p className="text-2xl font-bold text-[hsl(var(--primary))]">{utilizationPercent.toFixed(1)}%</p>
                    <Progress value={utilizationPercent} className="h-2 mt-2 bg-card" />
                </Card>
            </div>

            {/* Budget by Campaign */}
            <Card className="p-5 bg-card border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Budget by Campaign</h3>

                {campaigns.length === 0 ? (
                    <p className="text-foreground/40 text-sm py-4 text-center">No campaigns to display.</p>
                ) : (
                    <div className="space-y-4">
                        {campaigns.map(campaign => {
                            const planned = campaign.budgetPlanned || 0;
                            const spent = campaign.spend || 0;
                            const percent = planned > 0 ? Math.min((spent / planned) * 100, 100) : 0;
                            const barWidth = totalBudget > 0 ? (planned / totalBudget) * 100 : 0;

                            return (
                                <div key={campaign.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-foreground">{campaign.name}</span>
                                            <Badge className={cn('text-[10px]', getStatusColor(campaign.status || 'draft'))}>
                                                {campaign.status || 'Draft'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-foreground/50">{formatCurrency(spent)}</span>
                                            <span className="text-foreground/30">/</span>
                                            <span className="text-foreground/70 font-medium">{formatCurrency(planned)}</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-card rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${percent}%`,
                                                backgroundColor: percent > 90 ? '#ef4444' : percent > 70 ? '#f59e0b' : 'hsl(var(--primary))',
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {/* Budget Pacing for Active Campaigns */}
            {activeCampaigns.length > 0 && (
                <Card className="p-5 bg-card border-border">
                    <h3 className="text-lg font-bold text-foreground mb-4">Budget Pacing - Active Campaigns</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {activeCampaigns.map(campaign => (
                            <div key={campaign.id} className="border border-border rounded-lg p-1">
                                <BudgetPacingWidget campaignId={campaign.id} compact />
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}

// ── Performance Tab ────────────────────────────────────────────────────────────

function PerformanceTab({ brandId, score, loading }: {
    brandId: string;
    score: IntelligenceScore | null;
    loading: boolean;
}) {
    const router = useRouter();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-foreground/30" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Overall Score */}
            <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">Intelligence Score</h3>
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-[hsl(var(--primary))]/30 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10"
                        onClick={() => router.push('/admin/analytics')}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" /> Full Dashboard
                    </Button>
                </div>

                {score?.overallScore != null ? (
                    <div className="flex items-center gap-6">
                        <div className="relative h-28 w-28">
                            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50" cy="50" r="42"
                                    fill="none"
                                    stroke="hsl(var(--foreground) / 0.06)"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="50" cy="50" r="42"
                                    fill="none"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(score.overallScore / 100) * 264} 264`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-foreground">{score.overallScore}</span>
                            </div>
                        </div>

                        {score.dimensions && score.dimensions.length > 0 && (
                            <div className="flex-1 space-y-3">
                                {score.dimensions.map(dim => (
                                    <div key={dim.name} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-foreground/60">{dim.name}</span>
                                            <span className="text-foreground font-medium">{dim.score}/100</span>
                                        </div>
                                        <Progress value={dim.score} className="h-1.5 bg-card" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <TrendingUp className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                        <p className="text-foreground/40">No intelligence score available yet.</p>
                        <p className="text-foreground/30 text-sm mt-1">
                            Connect integrations and run campaigns to generate performance insights.
                        </p>
                    </div>
                )}
            </Card>

            {/* Quick Links */}
            <Card className="p-5 bg-card border-border">
                <h3 className="text-lg font-bold text-foreground mb-3">Analytics Quick Links</h3>
                <div className="grid gap-3 md:grid-cols-2">
                    <Button
                        variant="outline"
                        className="justify-start h-auto py-3 border-border hover:bg-card"
                        onClick={() => router.push('/admin/analytics')}
                    >
                        <BarChart3 className="h-4 w-4 mr-3 text-[hsl(var(--primary))]" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-foreground">Analytics Dashboard</p>
                            <p className="text-xs text-foreground/40">View detailed campaign analytics</p>
                        </div>
                    </Button>
                    <Button
                        variant="outline"
                        className="justify-start h-auto py-3 border-border hover:bg-card"
                        onClick={() => router.push('/admin/campaign-rules')}
                    >
                        <Zap className="h-4 w-4 mr-3 text-[hsl(var(--primary))]" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-foreground">Automation Rules</p>
                            <p className="text-xs text-foreground/40">Configure campaign automation</p>
                        </div>
                    </Button>
                </div>
            </Card>
        </div>
    );
}
