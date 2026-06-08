'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Loader2, Briefcase } from 'lucide-react';
import { api, type Brand, type Campaign } from '@/services/api';

interface BrandOverviewWidgetProps {
    brandId?: string;
}

export function BrandOverviewWidget({ brandId }: BrandOverviewWidgetProps) {
    const [brand, setBrand] = useState<Brand | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!brandId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [brandData, campaignData] = await Promise.all([
                api.brands.getById(brandId),
                api.campaigns.getAll({ brandId }),
            ]);
            setBrand(brandData);
            setCampaigns(campaignData);
        } catch {
            // Silently fail
        } finally {
            setLoading(false);
        }
    }, [brandId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const stats = useMemo(() => {
        const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
        const totalBudget = campaigns.reduce((sum, c) => sum + (c.budgetPlanned || 0), 0);
        const totalSpend = campaigns.reduce((sum, c) => sum + (c.spend || 0), 0);
        return {
            campaignCount: campaigns.length,
            activeCampaigns,
            totalBudget,
            totalSpend,
            hasSpend: campaigns.some(c => typeof c.spend === 'number' && c.spend > 0),
        };
    }, [campaigns]);

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

    const fmt = (n: number) =>
        n >= 1_000_000
            ? `$${(n / 1_000_000).toFixed(1)}M`
            : n >= 1_000
              ? `$${(n / 1_000).toFixed(1)}K`
              : `$${n.toFixed(0)}`;

    return (
        <div className="bg-card border border-border rounded-xl p-4">
            {/* Brand header */}
            <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                <h3 className="text-sm font-bold text-foreground truncate">
                    {brand?.name || 'Brand'}
                </h3>
            </div>

            {/* Metric grid */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <p className="text-[10px] text-foreground-soft uppercase tracking-wide">Campaigns</p>
                    <p className="text-lg font-bold text-foreground">{stats.campaignCount}</p>
                </div>
                <div>
                    <p className="text-[10px] text-foreground-soft uppercase tracking-wide">Active</p>
                    <p className="text-lg font-bold text-primary">{stats.activeCampaigns}</p>
                </div>
                <div>
                    <p className="text-[10px] text-foreground-soft uppercase tracking-wide">Budget</p>
                    <p className="text-lg font-bold text-foreground">
                        {stats.totalBudget > 0 ? fmt(stats.totalBudget) : '\u2014'}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] text-foreground-soft uppercase tracking-wide">Spend</p>
                    <p className="text-lg font-bold text-foreground">
                        {stats.hasSpend ? fmt(stats.totalSpend) : '\u2014'}
                    </p>
                </div>
            </div>
        </div>
    );
}
