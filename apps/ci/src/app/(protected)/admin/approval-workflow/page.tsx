'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApprovalKanban } from '@/components/campaigns/ApprovalKanban';
import { api } from '@/services/api';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Brand {
    id: string;
    name: string;
}

interface Campaign {
    id: string;
    name: string;
    approvalStatus: string;
    budgetPlanned?: number;
    startDate?: string;
    endDate?: string;
    brand?: { name: string };
    brandName?: string;
}

export default function ApprovalWorkflowPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBrands = useCallback(async () => {
        try {
            const data = await api.brands.getAll();
            setBrands(data);
        } catch { /* silent */ }
    }, []);

    const fetchCampaigns = useCallback(async () => {
        try {
            const query: Record<string, string> = {};
            if (selectedBrandId !== 'all') query.brandId = selectedBrandId;
            const data: any[] = await api.campaigns.getAll(query);
            setCampaigns(data);
        } catch { /* silent */ }
    }, [selectedBrandId]);

    useEffect(() => { fetchBrands(); }, [fetchBrands]);

    useEffect(() => {
        setLoading(true);
        fetchCampaigns().finally(() => setLoading(false));
    }, [fetchCampaigns]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchCampaigns();
        setRefreshing(false);
    };

    // Map campaigns to kanban card format
    const kanbanData = campaigns.map(c => ({
        id: c.id,
        name: c.name,
        brandName: c.brandName || c.brand?.name,
        approvalStatus: c.approvalStatus || 'draft',
        budgetPlanned: c.budgetPlanned,
        startDate: c.startDate,
        endDate: c.endDate,
    }));

    // Stats
    const statusCounts = kanbanData.reduce<Record<string, number>>((acc, c) => {
        acc[c.approvalStatus] = (acc[c.approvalStatus] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · Approval Workflow
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    Approval Workflow
                </h1>
                <p className="mt-4 text-foreground-soft max-w-2xl">
                    Drag campaigns between stages to manage the approval pipeline. Visual overview of all campaign statuses.
                </p>
                <div className="mt-6 flex items-center gap-3">
                    <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
                        <SelectTrigger className="w-[200px] bg-card border-border text-foreground">
                            <SelectValue placeholder="All Brands" />
                        </SelectTrigger>
                        <SelectContent className="bg-background-2 border-border">
                            <SelectItem value="all" className="text-foreground-soft focus:bg-card focus:text-foreground">All Brands</SelectItem>
                            {brands.map(b => (
                                <SelectItem key={b.id} value={b.id} className="text-foreground-soft focus:bg-card focus:text-foreground">{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="border-border text-foreground-soft hover:bg-card"
                    >
                        <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="flex gap-3 flex-wrap">
                {[
                    { label: 'Total', count: kanbanData.length, color: 'hsl(var(--muted-foreground))' },
                    { label: 'Draft', count: statusCounts['draft'] || 0, color: 'hsl(var(--muted-foreground))' },
                    { label: 'Pending', count: statusCounts['pending_review'] || 0, color: 'hsl(var(--warning))' },
                    { label: 'Approved', count: statusCounts['approved'] || 0, color: 'hsl(var(--success))' },
                    { label: 'Active', count: statusCounts['active'] || 0, color: 'hsl(var(--primary))' },
                    { label: 'Paused', count: statusCounts['paused'] || 0, color: 'hsl(var(--warning))' },
                ].map(s => (
                    <div key={s.label} className="bg-card border border-border rounded-lg px-3 py-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-xs text-foreground-soft">{s.label}</span>
                        <span className="text-sm font-bold text-foreground">{s.count}</span>
                    </div>
                ))}
            </div>

            {/* Kanban Board */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
                </div>
            ) : kanbanData.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-foreground-soft text-sm">No campaigns found. Create a campaign first.</p>
                </div>
            ) : (
                <ApprovalKanban
                    campaigns={kanbanData}
                    onStatusChange={handleRefresh}
                    activeBrandFilter={selectedBrandId !== 'all' ? brands.find(b => b.id === selectedBrandId)?.name : undefined}
                />
            )}

            {/* Legend */}
            <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-xs font-bold text-foreground-soft uppercase tracking-wider mb-2">Workflow Rules</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-foreground-soft">
                    <div>Draft → Pending Review</div>
                    <div>Pending Review → Approved / Rejected</div>
                    <div>Approved → Active</div>
                    <div>Active → Paused / Completed</div>
                </div>
            </div>
        </div>
    );
}
