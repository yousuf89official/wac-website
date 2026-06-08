'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Activity, Target, Share2, ArrowLeft, Globe, Loader2, RefreshCw, Pencil
} from 'lucide-react';
import { toast } from 'sonner';

import {
    Brand, Campaign, Metric, Creative, INITIAL_DATA
} from '@/lib/brand-constants';
import { EnrichedBrand } from '@/lib/brands-data';
import { Badge, Button } from './BrandPrimitives';
import { BrandAvatar } from './BrandAvatar';
import { ShareLinkDialog } from './ShareLinkDialog';
import { DashboardAnalyticsView } from './DashboardAnalyticsView';
import DataManagementView from './DataManagementView';
import { IntelligencePanel } from './IntelligencePanel';
import { EditBrandModal } from './EditBrandModal';
import { cn } from '@/lib/utils';

interface BrandDashboardProps {
    brand: EnrichedBrand;
    industries: any[];
}

/**
 * Map a Prisma campaign record to the legacy Campaign type used by UI components.
 */
function mapDbCampaign(c: any, brandId: string): Campaign {
    return {
        id: c.id,
        brand_id: brandId,
        name: c.name,
        types: [],
        configurations: [],
        status: c.status === 'Active' ? 'running' : c.status === 'Draft' ? 'draft' : 'finished',
        is_active: c.status === 'Active',
        funnel_type: 'TOP',
        start_date: c.startDate || '',
        end_date: c.endDate || '',
        cost_idr: c.budgetPlanned || 0,
        markup_percent: 0,
        channel_ids: (c.channels || []).map((ch: any) => ch.channelId || ch.channel?.id),
    };
}

/**
 * Map Prisma metric records to the legacy Metric type used by UI components.
 */
function mapDbMetric(m: any): Metric {
    return {
        campaign_id: m.campaignId || '',
        date: typeof m.date === 'string' ? m.date : new Date(m.date).toISOString().split('T')[0],
        impressions: m.impressions || 0,
        clicks: m.clicks || 0,
        spend: m.spend || 0,
        reach: m.reach || 0,
        engagements: m.engagement || 0,
    };
}

export default function BrandDashboard({ brand: initialBrand, industries }: BrandDashboardProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'new-campaign'>('dashboard');
    const [brand, setBrand] = useState<Brand>(initialBrand as unknown as Brand);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [creatives, setCreatives] = useState<Creative[]>([]);
    const [loading, setLoading] = useState(true);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Fetch real data from database
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [campRes, analyticsRes] = await Promise.allSettled([
                fetch(`/api/campaigns?brandId=${brand.id}`),
                fetch(`/api/analytics?brandId=${brand.id}`),
            ]);

            // Map campaigns from DB format to UI format
            if (campRes.status === 'fulfilled' && campRes.value.ok) {
                const dbCampaigns = await campRes.value.json();
                const mapped = dbCampaigns.map((c: any) => mapDbCampaign(c, brand.id));
                if (mapped.length > 0) {
                    setCampaigns(mapped);
                } else {
                    // Fallback to mock data only if no real campaigns exist
                    const mocks = INITIAL_DATA.campaigns.filter(c => c.brand_id === brand.id);
                    setCampaigns(mocks);
                }
            }

            // Map metrics from DB
            if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
                const data = await analyticsRes.value.json();
                if (data.trend && data.trend.length > 0) {
                    const mapped = data.trend.map((m: any) => mapDbMetric(m));
                    setMetrics(mapped);
                } else {
                    // Fallback to mock metrics only if no real data
                    const campaignIds = campaigns.map(c => c.id);
                    const mocks = INITIAL_DATA.metrics.filter(m => campaignIds.includes(m.campaign_id));
                    setMetrics(mocks);
                }
            }

            // Creatives — will be from DB once creative API is built
            setCreatives(INITIAL_DATA.creatives);
        } catch (err) {
            console.error('Failed to fetch brand data:', err);
            // Fall back to mock data on error
            const mocks = INITIAL_DATA.campaigns.filter(c => c.brand_id === brand.id);
            setCampaigns(mocks);
            setMetrics(INITIAL_DATA.metrics.filter(m => mocks.some(c => c.id === m.campaign_id)));
            setCreatives(INITIAL_DATA.creatives);
        } finally {
            setLoading(false);
        }
    }, [brand.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Refresh handler — re-fetches from database
    const handleRefreshBrand = () => {
        fetchData();
        router.refresh();
    };

    // Campaign Handlers
    const handleUpdateCampaign = async (id: string, field: string, val: any) => {
        // Update local state immediately (optimistic)
        setCampaigns(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));

        // Persist to database
        try {
            const updateData: any = {};
            if (field === 'name') updateData.name = val;
            if (field === 'status') updateData.status = val === 'running' ? 'Active' : val === 'draft' ? 'Draft' : 'Completed';
            if (field === 'is_active') updateData.status = val ? 'Active' : 'Paused';
            if (field === 'cost_idr') updateData.budgetPlanned = val;

            if (Object.keys(updateData).length > 0) {
                const res = await fetch(`/api/campaigns/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData),
                });
                if (!res.ok) {
                    toast.error('Failed to save changes');
                    fetchData(); // Revert on error
                }
            }
        } catch {
            toast.error('Failed to save changes');
        }
    };

    const handleAddCampaign = (newCampaign: Campaign) => {
        setCampaigns(prev => [newCampaign, ...prev]);
        toast.success("New campaign initialized");
        // Refresh to get the full campaign data from DB
        setTimeout(fetchData, 500);
    };

    const handleSaveCampaign = async () => {
        toast.success("Campaign configuration saved");
        await fetchData();
    };

    const handleDeleteCampaign = async (id: string, name: string) => {
        if (!confirm(`Delete campaign "${name}"?`)) return;

        try {
            const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCampaigns(prev => prev.filter(c => c.id !== id));
                toast.success("Campaign deleted");
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to delete campaign');
            }
        } catch {
            toast.error('Failed to delete campaign');
        }
    };

    const handleArchiveCampaign = async (id: string, name: string) => {
        if (!confirm(`Archive campaign "${name}"? You can restore it later.`)) return;

        try {
            const res = await fetch(`/api/campaigns/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Archive' }),
            });
            if (res.ok) {
                setCampaigns(prev => prev.filter(c => c.id !== id));
                toast.success("Campaign archived");
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to archive campaign');
            }
        } catch {
            toast.error('Failed to archive campaign');
        }
    };

    const handleRestoreCampaign = async (id: string, name: string) => {
        try {
            const res = await fetch(`/api/campaigns/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Active' }),
            });
            if (res.ok) {
                toast.success(`Campaign "${name}" restored`);
                await fetchData();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to restore campaign');
            }
        } catch {
            toast.error('Failed to restore campaign');
        }
    };

    const handleAddCreative = (creative: Creative) => {
        setCreatives(prev => [...prev, creative]);
    };

    const handleAlert = (title: string, message: string, type: any) => {
        toast(title, { description: message });
    };

    // Derived State
    const activeCampaigns = campaigns.filter(c => c.is_active).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col gap-6">
                <Link href="/brands" className="flex items-center gap-2 text-xs font-bold text-foreground-soft hover:text-primary transition-colors w-fit group">
                    <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                    BACK TO PORTFOLIO
                </Link>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                            <BrandAvatar
                                logo_url={brand.logo_url}
                                name={brand.name}
                                size="lg"
                                brand_color={brand.brandColor || undefined}
                                containerClassName="h-20 w-20 ring-4 ring-card shadow-xl relative z-10"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black text-foreground tracking-tight">{brand.name}</h1>
                                <Badge variant={brand.status === 'Active' ? 'active' : 'inactive'}>{brand.status}</Badge>
                                <button onClick={() => setIsEditModalOpen(true)} className="p-1.5 rounded-lg hover:bg-card text-foreground-soft hover:text-primary transition-colors" title="Edit brand">
                                    <Pencil className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-foreground-soft">
                                <span className="flex items-center gap-1.5 bg-card border border-border px-2 py-1 rounded-md">
                                    <Globe className="h-3 w-3" />
                                    {brand.markets?.[0] || 'Global'}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-foreground-soft" />
                                <span className="uppercase tracking-wider">{brand.categories?.[0] || 'General'}</span>
                                <span className="w-1 h-1 rounded-full bg-foreground-soft" />
                                <span className="text-primary">{activeCampaigns} Active Campaigns</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-card p-1 rounded-2xl shadow-sm border border-border flex items-center">
                            <button onClick={() => setActiveTab('dashboard')} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center", activeTab === 'dashboard' ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "text-foreground-soft hover:text-foreground hover:bg-card")}>
                                <Activity className="h-4 w-4" /> Overview
                            </button>
                            <button onClick={() => setActiveTab('new-campaign')} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center", activeTab === 'new-campaign' ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "text-foreground-soft hover:text-foreground hover:bg-card")}>
                                <Target className="h-4 w-4" /> Operations
                            </button>
                        </div>
                        <div className="h-8 w-px bg-border mx-2" />
                        <button onClick={handleRefreshBrand} className="p-2.5 rounded-xl border border-border text-foreground-soft hover:text-foreground hover:bg-card transition-all" title="Refresh data">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <Button variant="primary" onClick={() => setIsShareDialogOpen(true)} className="h-12 px-6 shadow-lg shadow-primary/20 gap-2">
                            <Share2 className="h-4 w-4" /> SHARE
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="mt-8">
                {loading && campaigns.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                            <p className="text-xs text-foreground-soft">Loading campaign data...</p>
                        </div>
                    </div>
                ) : activeTab === 'dashboard' ? (
                    <div className="space-y-8">
                        <DashboardAnalyticsView
                            brand={brand}
                            campaigns={campaigns}
                            metrics={metrics}
                            creatives={creatives}
                            onExecuteClick={() => setActiveTab('new-campaign')}
                        />
                        <div className="p-6 rounded-2xl border border-border bg-card">
                            <IntelligencePanel brandId={brand.id} />
                        </div>
                    </div>
                ) : (
                    <DataManagementView
                        brand={brand}
                        campaigns={campaigns}
                        creatives={creatives}
                        onUpdateCampaign={handleUpdateCampaign}
                        onAddCampaign={handleAddCampaign}
                        onSaveCampaign={handleSaveCampaign}
                        onDeleteCampaign={handleDeleteCampaign}
                        onArchiveCampaign={handleArchiveCampaign}
                        onRestoreCampaign={handleRestoreCampaign}
                        onAddCreative={handleAddCreative}
                        showAlert={handleAlert}
                        onRefreshBrand={handleRefreshBrand}
                    />
                )}
            </div>

            <ShareLinkDialog
                isOpen={isShareDialogOpen}
                onClose={() => setIsShareDialogOpen(false)}
                brandId={brand.id}
                brandName={brand.name}
            />

            <EditBrandModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                brand={brand}
                industries={industries}
                onUpdated={() => { handleRefreshBrand(); }}
            />
        </div>
    );
}
