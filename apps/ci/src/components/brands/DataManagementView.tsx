
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Target,
    TrendingUp,
    DollarSign,
    Image as ImageIcon,
    Filter,
    ArrowLeft,
    Instagram,
    Globe,
    Loader2,
    Megaphone,
    Layers,
    Calendar,
    Users,
    Save,
    Layout,
    Database,
    Check,
    Link2,
    Power,
    Activity,
    Youtube,
    Facebook,
    Smartphone,
    Trash2,
    FileText,
    Video,
    X,
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Eye,
    BarChart3,
    MousePointer2,
    Copy,
    MousePointerClick,
    RefreshCcw,
    Archive,
    RotateCcw,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    Brand,
    Campaign,
    Creative,
    Metric,
    INITIAL_DATA,
    CampaignTypeConfig,
    MetricConfig
} from '@/lib/brand-constants';
import { Button, Input, Label, SelectWrapper, Card } from '@/components/brands/BrandPrimitives';
import { IntegrationsCard } from './IntegrationsCard';

// =============================================================================
// HELPERS
// =============================================================================

const formatCurrency = (amount: number, currency = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
};

const PlatformIcon = ({ id, size = 4, color = "currentColor" }: { id: string, size?: number, color?: string }) => {
    const channel = INITIAL_DATA.master_channels.find(c => c.id === id);
    const className = `h-${size} w-${size}`;
    if (!channel) return <Globe className={className} stroke={color} />;
    switch (channel.icon) {
        case 'instagram': return <Instagram className={className} stroke={color} />;
        case 'facebook': return <Facebook className={className} stroke={color} />;
        case 'youtube': return <Youtube className={className} stroke={color} />;
        case 'tiktok': return <Smartphone className={className} stroke={color} />;
        default: return <Globe className={className} stroke={color} />;
    }
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const CampaignTypeConfigurator = ({
    typeId,
    config,
    onUpdate
}: {
    typeId: string,
    config: CampaignTypeConfig | undefined,
    onUpdate: (newConfig: CampaignTypeConfig) => void
}) => {
    const typeDef = INITIAL_DATA.master_types.find(t => t.id === typeId);
    if (!typeDef) return null;

    const currentConfig = config || {
        campaignTypeId: typeId,
        selectedChannelIds: [],
        metrics: [],
        customFields: {}
    };

    const handleChannelToggle = (channelId: string) => {
        const currentIds = currentConfig.selectedChannelIds;
        let newIds = currentIds.includes(channelId)
            ? currentIds.filter(id => id !== channelId)
            : [...currentIds, channelId];

        let newMetrics = [...currentConfig.metrics];
        if (!currentIds.includes(channelId)) {
            const defaults = INITIAL_DATA.master_metrics
                .filter(m => m.type === 'cross-platform')
                .map(m => ({ metricId: m.id, targetValue: 0 }));

            defaults.forEach(d => {
                if (!newMetrics.find(m => m.metricId === d.metricId)) {
                    newMetrics.push(d);
                }
            });
        }
        onUpdate({ ...currentConfig, selectedChannelIds: newIds, metrics: newMetrics });
    };

    const handleMetricChange = (metricId: string, value: number) => {
        const newMetrics = currentConfig.metrics.map(m =>
            m.metricId === metricId ? { ...m, targetValue: value } : m
        );
        onUpdate({ ...currentConfig, metrics: newMetrics });
    };

    const addMetric = (metricId: string) => {
        if (currentConfig.metrics.find(m => m.metricId === metricId)) return;
        onUpdate({ ...currentConfig, metrics: [...currentConfig.metrics, { metricId, targetValue: 0 }] });
    };

    const removeMetric = (metricId: string) => {
        onUpdate({ ...currentConfig, metrics: currentConfig.metrics.filter(m => m.metricId !== metricId) });
    };

    const availableMetrics = INITIAL_DATA.master_metrics.filter(m => {
        const relatedChannelIds = currentConfig.selectedChannelIds;
        const relatedChannelTypes = relatedChannelIds.map(id => INITIAL_DATA.master_channels.find(c => c.id === id)?.icon);
        return m.type === 'cross-platform' || relatedChannelTypes.includes(m.type as any);
    });

    const availableMockups = INITIAL_DATA.master_mockups.filter(mock =>
        currentConfig.selectedChannelIds.includes(mock.channelId)
    );

    const availableChannelsToAdd = INITIAL_DATA.master_channels.filter(
        ch => !currentConfig.selectedChannelIds.includes(ch.id)
    );

    return (
        <div className="space-y-4">
            {/* Channels */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label>Active Channels</Label>
                    <div className="relative">
                        <select
                            className="flex h-8 w-40 items-center justify-between rounded-xl border border-border bg-card px-2 py-1 text-[10px] font-medium text-foreground shadow-sm ring-offset-transparent placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 appearance-none hover:bg-card/80 transition-colors cursor-pointer"
                            onChange={(e) => {
                                if (e.target.value) handleChannelToggle(e.target.value);
                                e.target.value = "";
                            }}
                        >
                            <option value="" className="bg-background-2 text-foreground">+ Add Channel</option>
                            {availableChannelsToAdd.map(ch => (
                                <option key={ch.id} value={ch.id} className="bg-background-2 text-foreground">{ch.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground-soft">
                            <ChevronDown className="h-3 w-3" />
                        </div>
                    </div>
                </div>

                {/* Selected Channels Display */}
                {currentConfig.selectedChannelIds.length === 0 ? (
                    <div className="text-xs text-foreground-soft italic py-4 text-center bg-card rounded-xl border border-dashed border-border">
                        <MousePointerClick className="h-4 w-4 mx-auto mb-1 opacity-50" />
                        No channels active. Select channels to configure.
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {currentConfig.selectedChannelIds.map(id => {
                            const ch = INITIAL_DATA.master_channels.find(c => c.id === id);
                            if (!ch) return null;
                            return (
                                <button
                                    key={ch.id}
                                    style={{
                                        backgroundColor: ch.color,
                                        borderColor: ch.color,
                                        color: '#fff'
                                    }}
                                    onClick={() => handleChannelToggle(ch.id)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-md hover:opacity-90 hover:scale-105 transition-all duration-200 group"
                                >
                                    <PlatformIcon id={ch.id} size={3} color="white" />
                                    {ch.name}
                                    <div className="w-4 h-4 bg-foreground/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="h-2.5 w-2.5 text-foreground" />
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {currentConfig.selectedChannelIds.length > 0 && (
                <>
                    {typeId === 'ct_social' && (
                        <div className="grid grid-cols-2 gap-3 bg-primary/10 p-3 rounded-xl border border-primary/20">
                            <div className="space-y-1">
                                <Label>Content Volume / Month</Label>
                                <Input
                                    type="number"
                                    value={currentConfig.customFields?.contentCount || 0}
                                    onChange={(e: any) => onUpdate({
                                        ...currentConfig,
                                        customFields: { ...currentConfig.customFields, contentCount: parseInt(e.target.value) || 0 }
                                    })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Calendar URL</Label>
                                <Input
                                    placeholder="https://"
                                    value={currentConfig.customFields?.calendarUrl || ''}
                                    onChange={(e: any) => onUpdate({
                                        ...currentConfig,
                                        customFields: { ...currentConfig.customFields, calendarUrl: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>KPI Targets</Label>
                            <SelectWrapper className="w-32 h-7 text-[10px]" onChange={(e: any) => addMetric(e.target.value)} value="">
                                <option value="" className="bg-background-2 text-foreground">+ Add KPI</option>
                                {availableMetrics.map(m => (
                                    <option key={m.id} value={m.id} className="bg-background-2 text-foreground">{m.name}</option>
                                ))}
                            </SelectWrapper>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {currentConfig.metrics.map(mConfig => {
                                const mDef = INITIAL_DATA.master_metrics.find(md => md.id === mConfig.metricId);
                                if (!mDef) return null;
                                const isCrossPlatform = mDef.type === 'cross-platform';
                                return (
                                    <div key={mConfig.metricId} className="flex items-center gap-2 text-xs bg-card px-3 py-1.5 rounded-lg border border-border group hover:border-primary/40 transition-colors shadow-sm">
                                        <span className="flex-1 font-semibold text-foreground-soft truncate" title={mDef.name}>{mDef.name}</span>
                                        <input
                                            type="number"
                                            className="w-16 h-6 text-right text-xs bg-transparent border-0 border-b border-transparent focus:border-primary/40 focus:ring-0 p-0 font-medium"
                                            placeholder="0"
                                            value={mConfig.targetValue || 0}
                                            onChange={(e: any) => handleMetricChange(mConfig.metricId, parseInt(e.target.value) || 0)}
                                        />
                                        {!isCrossPlatform && (
                                            <button onClick={() => removeMetric(mConfig.metricId)} className="text-foreground-soft hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Deliverables</Label>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide pt-1">
                            {availableMockups.map(mock => (
                                <div key={mock.id} className="flex-shrink-0 w-16 group cursor-help transition-transform hover:-translate-y-1 duration-300">
                                    <div className={`w-full bg-card rounded-lg border border-border relative ${mock.aspectRatio} transition-all group-hover:shadow-md group-hover:border-primary/40 overflow-hidden`}>
                                        <div className="absolute inset-0 flex items-center justify-center text-foreground-soft bg-card">
                                            {mock.type === 'video' ? <Video className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                                        </div>
                                        <div className="absolute top-1 right-1 bg-card rounded-full p-0.5 shadow-sm">
                                            <PlatformIcon id={mock.channelId} size={3} />
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-center text-foreground-soft font-medium truncate mt-1.5">{mock.name}</p>
                                </div>
                            ))}
                            {availableMockups.length === 0 && <span className="text-[10px] text-foreground-soft italic">Select channels to view deliverables</span>}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const CampaignEditCard = ({
    campaign,
    brandId,
    onUpdate,
    onSave,
    onDelete,
    onArchive,
    creatives,
    onAddCreative,
    showAlert
}: {
    campaign: Campaign,
    brandId: string,
    onUpdate: (id: string, field: keyof Campaign, val: any) => void,
    onSave: () => void,
    onDelete: (id: string, name: string) => void,
    onArchive: (id: string, name: string) => void,
    creatives: Creative[],
    onAddCreative: (creative: Creative) => void,
    showAlert: (title: string, message: string, type: any) => void
}) => {
    const [activeConfigType, setActiveConfigType] = useState<string>(
        campaign.types.length > 0 ? campaign.types[0] : ''
    );
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedCreativeForMockup, setSelectedCreativeForMockup] = useState<Creative | null>(null);
    const [showIntegrations, setShowIntegrations] = useState(false);

    // Filter metrics using INITIAL_DATA hack for now (ideally props)
    const campaignMetrics = INITIAL_DATA.metrics.filter(m => m.campaign_id === campaign.id);
    const campaignStats = useMemo(() => {
        const totalSpend = campaignMetrics.reduce((sum, m) => sum + m.spend, 0);
        const totalImpressions = campaignMetrics.reduce((sum, m) => sum + m.impressions, 0);
        const totalClicks = campaignMetrics.reduce((sum, m) => sum + m.clicks, 0);
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        return { totalSpend, totalImpressions, totalClicks, ctr };
    }, [campaignMetrics]);

    // Creative Upload State
    const [newCreativeUrl, setNewCreativeUrl] = useState('https://via.placeholder.com/300?text=New+Ad');
    const [newCreativeName, setNewCreativeName] = useState('');

    // Determine active Master Type ID
    const activeTypeId = INITIAL_DATA.master_types.find(t => t.name === activeConfigType)?.id;

    // Filter Creatives based on active sub-campaign type
    const getSourceForType = (typeId: string | undefined): 'organic' | 'paid' | 'kol' | undefined => {
        if (typeId === 'ct_social') return 'organic';
        if (typeId === 'ct_kol') return 'kol';
        if (typeId === 'ct_paid') return 'paid';
        return undefined;
    };

    const activeSource = getSourceForType(activeTypeId);

    const campaignCreatives = creatives.filter(c =>
        c.campaign_id === campaign.id &&
        (activeSource ? c.source === activeSource : true)
    );

    useEffect(() => {
        if (activeConfigType && !campaign.types.includes(activeConfigType)) {
            setActiveConfigType(campaign.types.length > 0 ? campaign.types[0] : '');
        } else if (!activeConfigType && campaign.types.length > 0) {
            setActiveConfigType(campaign.types[0]);
        }
    }, [campaign.types, activeConfigType]);

    const updateConfig = (newConfig: CampaignTypeConfig) => {
        const newConfigs = campaign.configurations.map(conf =>
            conf.campaignTypeId === newConfig.campaignTypeId ? newConfig : conf
        );
        onUpdate(campaign.id, 'configurations' as any, newConfigs);
    };

    const handleSubCampaignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value.startsWith('add_')) {
            const typeIdToAdd = value.replace('add_', '');
            const typeToAdd = INITIAL_DATA.master_types.find(t => t.id === typeIdToAdd);
            if (typeToAdd) {
                const newTypes = [...campaign.types, typeToAdd.name];
                const newConfig: CampaignTypeConfig = {
                    campaignTypeId: typeIdToAdd,
                    selectedChannelIds: [],
                    metrics: []
                };
                const newConfigs = [...campaign.configurations, newConfig];
                onUpdate(campaign.id, 'types' as any, newTypes);
                onUpdate(campaign.id, 'configurations' as any, newConfigs);
                setActiveConfigType(typeToAdd.name);
            }
        } else {
            setActiveConfigType(value);
        }
    };


    const handleUpload = () => {
        if (!newCreativeName) return;
        const newCreative: Creative = {
            id: `cr_new_${Date.now()}`,
            campaign_id: campaign.id,
            name: newCreativeName,
            image_url: newCreativeUrl,
            source: activeSource || 'paid',
            platform: 'instagram',
            metrics: { impressions: 0 }
        };
        onAddCreative(newCreative);
        setNewCreativeName('');
        toast.success("Creative added successfully");
    };

    const activeConfig = campaign.configurations.find(c => c.campaignTypeId === activeTypeId);

    const availableTypesToAdd = INITIAL_DATA.master_types.filter(
        mt => !campaign.types.includes(mt.name)
    );

    return (
        <Card className={cn(
            "rounded-2xl border border-border bg-card text-foreground shadow-sm transition-all duration-300 overflow-hidden group mb-4",
            isExpanded ? "ring-2 ring-primary/20 shadow-xl scale-[1.01]" : "hover:shadow-md hover:border-border"
        )}>
            {/* NEW PREMIUM HEADER */}
            <header className="bg-card border-b border-border p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 rounded-md hover:bg-card transition-colors text-foreground-soft"
                        >
                            <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", !isExpanded && "-rotate-90")} />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    {campaign.is_active && (
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                                    )}
                                    <span className={cn(
                                        "relative inline-flex rounded-full h-3 w-3",
                                        campaign.is_active ? "bg-success" : "bg-foreground/20"
                                    )}></span>
                                </span>
                                <input
                                    value={campaign.name}
                                    onChange={(e) => onUpdate(campaign.id, 'name', e.target.value)}
                                    className="text-lg font-bold text-foreground tracking-tight bg-transparent border-none p-0 focus:ring-0 hover:bg-card px-2 py-0.5 rounded transition-colors w-auto min-w-[100px]"
                                    placeholder="Campaign Name"
                                />
                            </div>

                            <div className="h-4 w-px bg-border mx-2"></div>

                            <div className="flex items-center gap-2 group cursor-pointer">
                                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-soft">Funnel:</span>
                                <select
                                    value={campaign.funnel_type}
                                    onChange={(e) => onUpdate(campaign.id, 'funnel_type', e.target.value)}
                                    className="text-sm font-medium text-foreground-soft bg-transparent border-none p-0 focus:ring-0 hover:text-primary border-b border-dashed border-border hover:border-primary/40 cursor-pointer pb-0.5 appearance-none"
                                >
                                    <option value="TOP" className="bg-background-2 text-foreground">Top</option>
                                    <option value="MID" className="bg-background-2 text-foreground">Mid</option>
                                    <option value="BOTTOM" className="bg-background-2 text-foreground">Bottom</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="text-xs font-semibold text-primary hover:text-primary transition-colors uppercase tracking-wide mr-2"
                            onClick={() => {
                                if (availableTypesToAdd.length > 0) {
                                    handleSubCampaignChange({ target: { value: `add_${availableTypesToAdd[0].id}` } } as any);
                                }
                            }}
                        >
                            + NEW SUB CAMPAIGN
                        </button>

                        <button
                            onClick={() => onUpdate(campaign.id, 'is_active', !campaign.is_active)}
                            className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-full transition-all",
                                campaign.is_active ? "text-success bg-success/10" : "text-foreground-soft hover:bg-card"
                            )}
                            title={campaign.is_active ? "Pause Campaign" : "Resume Campaign"}
                        >
                            <Power className="h-5 w-5" />
                        </button>

                        <button
                            onClick={() => onArchive(campaign.id, campaign.name)}
                            className="flex items-center justify-center w-10 h-10 rounded-full text-foreground-soft hover:text-warning hover:bg-warning/10 transition-all"
                            title="Archive Campaign"
                        >
                            <Archive className="h-5 w-5" />
                        </button>

                        <button
                            onClick={() => onDelete(campaign.id, campaign.name)}
                            className="flex items-center justify-center w-10 h-10 rounded-full text-foreground-soft hover:text-destructive hover:bg-destructive/10 transition-all"
                            title="Delete Campaign"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* EXPANDED CONTENT AREA */}
            {isExpanded && (
                <main className="p-6 space-y-6 bg-card">
                    {/* PERFORMANCE SNAPSHOT */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Spend', value: formatCurrency(campaignStats.totalSpend), icon: DollarSign, color: 'text-foreground' },
                            { label: 'Impressions', value: `${(campaignStats.totalImpressions / 1e3).toFixed(1)}K`, icon: BarChart3, color: 'text-foreground' },
                            { label: 'Clicks', value: `${(campaignStats.totalClicks / 1e3).toFixed(1)}K`, icon: MousePointer2, color: 'text-foreground' },
                            { label: 'Avg. CTR', value: `${campaignStats.ctr.toFixed(2)}%`, icon: TrendingUp, color: 'text-success' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-foreground-soft uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className={cn("text-lg font-black tracking-tight", stat.color)}>{stat.value}</p>
                                </div>
                                <div className="p-2 bg-card rounded-lg text-foreground-soft">
                                    <stat.icon className="h-5 w-5" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* SUB CAMPAIGN CONFIGURATION */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        {activeTypeId ? (
                            <div className="p-0">
                                <div className="p-4 bg-card border-b border-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <Layers className="h-4 w-4" />
                                        </div>
                                        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{activeConfigType} Configuration</h2>
                                    </div>
                                    <SelectWrapper
                                        className="h-8 text-[10px] w-48"
                                        value={activeConfigType}
                                        onChange={handleSubCampaignChange}
                                    >
                                        <optgroup label="Active Sub Campaigns">
                                            {campaign.types.map(t => <option key={t} value={t} className="bg-background-2 text-foreground">{t}</option>)}
                                        </optgroup>
                                        {availableTypesToAdd.length > 0 && (
                                            <optgroup label="Add New">
                                                {availableTypesToAdd.map(t => (
                                                    <option key={t.id} value={`add_${t.id}`} className="bg-background-2 text-foreground">+ Add {t.name}</option>
                                                ))}
                                            </optgroup>
                                        )}
                                    </SelectWrapper>
                                </div>
                                <CampaignTypeConfigurator
                                    key={activeTypeId}
                                    typeId={activeTypeId}
                                    config={activeConfig}
                                    onUpdate={(newConfig) => updateConfig(newConfig)}
                                />
                            </div>
                        ) : (
                            <div className="min-h-[200px] flex flex-col items-center justify-center p-12">
                                <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4 border border-dashed border-border font-bold">
                                    <RefreshCcw className="h-8 w-8 text-foreground-soft" />
                                </div>
                                <h3 className="text-sm font-medium text-foreground">Configuration Required</h3>
                                <p className="mt-1 text-sm text-foreground-soft text-center max-w-xs">
                                    Select a sub campaign to begin configuring specific parameters.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* PLATFORM CONNECTIONS */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Link2 className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Platform Connections</h2>
                                </div>
                                <button
                                    onClick={() => setShowIntegrations(!showIntegrations)}
                                    className="text-xs font-semibold text-primary hover:text-primary transition-colors uppercase tracking-wide flex items-center group"
                                >
                                    {showIntegrations ? 'Hide Connections' : 'Manage Connections'}
                                    <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>

                            <div className="bg-card rounded-lg p-4 border border-border">
                                {showIntegrations ? (
                                    <IntegrationsCard brandId={brandId} />
                                ) : (
                                    <>
                                        <p className="text-sm text-foreground-soft mb-4">
                                            Link this campaign to active platform integrations for real-time tracking and automated adjustments.
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-card text-foreground-soft border border-border">
                                                <span className="w-1.5 h-1.5 rounded-full bg-foreground-soft mr-1.5"></span>
                                                No Active Link
                                            </span>
                                            <span className="text-xs text-foreground-soft italic flex items-center">
                                                <Activity className="h-3 w-3 mr-1" />
                                                Analytics currently using simulated data
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CREATIVE MANAGEMENT IF TYPE SELECTED */}
                    {activeTypeId && (
                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-success/10 rounded-lg text-success">
                                            <ImageIcon className="h-4 w-4" />
                                        </div>
                                        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Creative Assets ({activeSource})</h2>
                                    </div>
                                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{campaignCreatives.length} active</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                                    {campaignCreatives.map(c => (
                                        <div key={c.id} className="relative group aspect-square rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all">
                                            <img src={c.image_url} alt={c.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-background-2/80 via-background-2/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedCreativeForMockup(c); }}
                                                    className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-card/80 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4 text-foreground" />
                                                </button>
                                                <span className="text-[9px] text-foreground font-bold text-center px-1 truncate w-full">{c.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {/* simulation */ }}
                                        className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary/40 hover:bg-card transition-all text-foreground-soft hover:text-primary"
                                    >
                                        <Plus className="h-6 w-6" />
                                        <span className="text-[10px] font-bold">Add New</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            )}
        </Card>
    );
};

const PublicAccessManagement = ({ brand, onRefresh }: { brand: Brand, onRefresh: () => void }) => {
    const handleToggle = async (token: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/share/${token}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) {
                toast.success(currentStatus ? "Public access disabled" : "Public access enabled");
                onRefresh();
            } else {
                toast.error("Failed to update access status");
            }
        } catch (error) {
            toast.error("Connection error");
        }
    };

    const activeLinks = brand.shareLinks || [];

    if (activeLinks.length === 0) return null;

    return (
        <Card className="p-6 border border-border shadow-xl bg-card rounded-3xl mb-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                    <Globe className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Public Access Management</h3>
                    <p className="text-[10px] text-foreground-soft font-medium">Control visibility of live intelligence dashboards.</p>
                </div>
            </div>

            <div className="space-y-3">
                {activeLinks.map(link => (
                    <div key={link.id} className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border group transition-all hover:border-primary/30">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "h-2 w-2 rounded-full",
                                link.isActive ? "bg-success animate-pulse" : "bg-foreground/20"
                            )} />
                            <div className="space-y-1">
                                <div className="text-[10px] font-black text-foreground flex items-center gap-2">
                                    <span className="opacity-40 tracking-widest uppercase">Branded URL</span>
                                    <span className="text-primary">/brand/{brand.name.replace(/\s+/g, '')}/IntelligenceDashboard</span>
                                </div>
                                <div className="text-[9px] font-bold text-foreground-soft uppercase tracking-widest flex items-center gap-3">
                                    <span>Token: <span className="text-foreground-soft">{link.token}</span></span>
                                    <span>Added: {brand.created_at ? new Date(brand.created_at).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-xl border border-border">
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest",
                                    link.isActive ? "text-success" : "text-foreground-soft"
                                )}>
                                    {link.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                                <button
                                    onClick={() => handleToggle(link.token, link.isActive)}
                                    className={cn(
                                        "w-10 h-5 rounded-full relative transition-colors duration-300 focus:outline-none",
                                        link.isActive ? "bg-success" : "bg-foreground/20"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-1 left-1 w-3 h-3 bg-card rounded-full transition-transform duration-300",
                                        link.isActive ? "translate-x-5" : "translate-x-0"
                                    )} />
                                </button>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg border-border"
                                onClick={() => {
                                    const url = `${window.location.origin}/brand/${brand.name.replace(/\s+/g, '')}/IntelligenceDashboard`;
                                    navigator.clipboard.writeText(url);
                                    toast.success("Branded link copied");
                                }}
                            >
                                <Copy className="h-3.5 w-3.5 text-foreground-soft" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

// =============================================================================
// MAIN COMPONENT EXPORT
// =============================================================================

export default function DataManagementView({
    brand,
    campaigns,
    creatives,
    onUpdateCampaign,
    onAddCampaign,
    onSaveCampaign,
    onDeleteCampaign,
    onArchiveCampaign,
    onRestoreCampaign,
    onAddCreative,
    showAlert,
    onRefreshBrand
}: {
    brand: Brand,
    campaigns: Campaign[],
    creatives: Creative[],
    onUpdateCampaign: (id: string, field: keyof Campaign, val: any) => void,
    onAddCampaign: (newCampaign: Campaign) => void,
    onSaveCampaign: () => void,
    onDeleteCampaign: (id: string, name: string) => void,
    onArchiveCampaign: (id: string, name: string) => void,
    onRestoreCampaign: (id: string, name: string) => void,
    onAddCreative: (creative: Creative) => void,
    showAlert: (title: string, message: string, type: any) => void,
    onRefreshBrand: () => void
}) {
    const brandId = brand.id;
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newFunnel, setNewFunnel] = useState<'TOP' | 'MID' | 'BOTTOM'>('TOP');
    const [showArchived, setShowArchived] = useState(false);
    const [archivedCampaigns, setArchivedCampaigns] = useState<any[]>([]);
    const [loadingArchived, setLoadingArchived] = useState(false);

    const fetchArchivedCampaigns = async () => {
        setLoadingArchived(true);
        try {
            const res = await fetch(`/api/campaigns?brandId=${brandId}&status=Archive`);
            if (res.ok) {
                const data = await res.json();
                setArchivedCampaigns(data);
            }
        } catch {
            // Silently fail
        } finally {
            setLoadingArchived(false);
        }
    };

    useEffect(() => {
        if (showArchived) {
            fetchArchivedCampaigns();
        }
    }, [showArchived]);

    const handleCreate = () => {
        if (!newName) return;
        const newCampaign: Campaign = {
            id: `cp_new_${Date.now()}`,
            brand_id: brandId,
            name: newName,
            types: [],
            configurations: [],
            status: 'draft',
            is_active: false,
            funnel_type: newFunnel,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cost_idr: 0,
            markup_percent: 15,
            channel_ids: []
        };
        onAddCampaign(newCampaign);
        setIsCreating(false);
        setNewName('');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center mb-2">
                <div className="space-y-0.5">
                    <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Campaign Operations</h2>
                    <p className="text-xs text-foreground-soft font-medium">Manage umbrella campaigns and sub-campaign intelligence.</p>
                </div>
            </div>

            <PublicAccessManagement brand={brand} onRefresh={onRefreshBrand} />

            <div className="flex justify-between items-center mb-2">
                <Dialog open={isCreating} onOpenChange={setIsCreating}>
                    <Button
                        onClick={() => setIsCreating(true)}
                        variant="primary"
                        className="gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <Plus className="h-4 w-4" /> INITIALIZE CAMPAIGN
                    </Button>
                    <DialogContent className="sm:max-w-[500px] bg-card border-primary/20 rounded-2xl shadow-2xl p-0 overflow-hidden">
                        <DialogHeader className="p-6 bg-card border-b border-border">
                            <DialogTitle className="text-xl font-black text-foreground uppercase tracking-tight">Initialize New Campaign</DialogTitle>
                        </DialogHeader>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-foreground-soft">Campaign Identity</Label>
                                <Input
                                    placeholder="e.g. Q1 Global Awareness 2026"
                                    value={newName}
                                    onChange={(e: any) => setNewName(e.target.value)}
                                    className="h-12 bg-card border-border focus:ring-primary/40 text-base font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-foreground-soft">Target Funnel Stage</Label>
                                <SelectWrapper
                                    value={newFunnel}
                                    onChange={(e: any) => setNewFunnel(e.target.value as any)}
                                    className="h-12 bg-card border-border focus:ring-primary/40"
                                >
                                    <option value="TOP" className="bg-background-2 text-foreground">Top (Awareness)</option>
                                    <option value="MID" className="bg-background-2 text-foreground">Mid (Consideration)</option>
                                    <option value="BOTTOM" className="bg-background-2 text-foreground">Bottom (Conversion)</option>
                                </SelectWrapper>
                                <p className="text-[10px] text-foreground-soft mt-1 italic">This sets the default strategy and AI optimization parameters.</p>
                            </div>
                        </div>
                        <DialogFooter className="p-6 bg-card border-t border-border flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setIsCreating(false)}
                                className="h-12 px-6 font-bold text-foreground-soft hover:text-foreground"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={!newName}
                                variant="primary"
                                className="flex-1 h-12 font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                INITIALIZE CAMPAIGN
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {campaigns.map(campaign => (
                    <CampaignEditCard
                        key={campaign.id}
                        campaign={campaign}
                        brandId={brandId}
                        onUpdate={onUpdateCampaign}
                        onSave={onSaveCampaign}
                        onDelete={onDeleteCampaign}
                        onArchive={onArchiveCampaign}
                        creatives={creatives}
                        onAddCreative={onAddCreative}
                        showAlert={showAlert}
                    />
                ))}
            </div>

            {/* Show Archived Toggle */}
            <div className="pt-4 border-t border-border">
                <button
                    onClick={() => setShowArchived(!showArchived)}
                    className="flex items-center gap-3 text-sm font-bold text-foreground-soft hover:text-foreground transition-colors"
                >
                    {showArchived ? (
                        <ToggleRight className="h-5 w-5 text-primary" />
                    ) : (
                        <ToggleLeft className="h-5 w-5" />
                    )}
                    <span>Show Archived Campaigns</span>
                </button>

                {showArchived && (
                    <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        {loadingArchived ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            </div>
                        ) : archivedCampaigns.length === 0 ? (
                            <div className="text-center py-8 text-foreground-soft text-sm">
                                No archived campaigns found.
                            </div>
                        ) : (
                            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-card border-b border-border">
                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-foreground-soft">Campaign</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-foreground-soft">Archived Date</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-foreground-soft">Status</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-foreground-soft">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {archivedCampaigns.map((campaign: any) => (
                                                <tr key={campaign.id} className="hover:bg-card transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-foreground text-sm">{campaign.name}</div>
                                                        <div className="text-[10px] text-foreground-soft font-mono">{campaign.slug}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-medium text-foreground-soft">
                                                            {new Date(campaign.updatedAt).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-card border border-border text-foreground-soft">
                                                            Archived
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    onRestoreCampaign(campaign.id, campaign.name);
                                                                    setTimeout(fetchArchivedCampaigns, 500);
                                                                }}
                                                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-card border border-border text-success hover:bg-success/10 hover:border-success/20 transition-all"
                                                                title="Restore to Active"
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    onDeleteCampaign(campaign.id, campaign.name);
                                                                    setTimeout(fetchArchivedCampaigns, 500);
                                                                }}
                                                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-card border border-border text-destructive hover:bg-destructive/10 hover:border-destructive/20 transition-all"
                                                                title="Delete Permanently"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
};
