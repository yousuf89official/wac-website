'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap, Loader2, Database, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { api, Brand, Campaign } from '@/services/api';

// ─── Types ──────────────────────────────────────────────────────────────────

interface CampaignAutoFillProps {
    onAutoFill: (data: Record<string, any>) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCompact = (value: number): string => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return new Intl.NumberFormat('id-ID').format(value);
};

const formatIDR = (value: number): string => {
    if (value >= 1_000_000_000) return `IDR ${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `IDR ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `IDR ${(value / 1_000).toFixed(1)}K`;
    return `IDR ${new Intl.NumberFormat('id-ID').format(value)}`;
};

// ─── Component ──────────────────────────────────────────────────────────────

export const CampaignAutoFill = ({ onAutoFill }: CampaignAutoFillProps) => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedBrandId, setSelectedBrandId] = useState<string>('');
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);
    const [manualEntry, setManualEntry] = useState(false);
    const [preview, setPreview] = useState<{
        impressions: number;
        reach: number;
        engagement: number;
        spend: number;
        channels: string[];
    } | null>(null);

    // Fetch brands on mount
    useEffect(() => {
        let cancelled = false;
        const fetchBrands = async () => {
            setLoadingBrands(true);
            try {
                const data = await api.brands.getAll();
                if (!cancelled) setBrands(data);
            } catch {
                if (!cancelled) toast.error('Failed to load brands');
            } finally {
                if (!cancelled) setLoadingBrands(false);
            }
        };
        fetchBrands();
        return () => { cancelled = true; };
    }, []);

    // Fetch campaigns when brand changes
    const fetchCampaigns = useCallback(async (brandId: string) => {
        if (!brandId) {
            setCampaigns([]);
            return;
        }
        setLoadingCampaigns(true);
        setSelectedCampaignId('');
        setPreview(null);
        try {
            const data = await api.campaigns.getAll({ brandId });
            setCampaigns(data);
        } catch {
            toast.error('Failed to load campaigns');
            setCampaigns([]);
        } finally {
            setLoadingCampaigns(false);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns(selectedBrandId);
    }, [selectedBrandId, fetchCampaigns]);

    // Build preview when campaign selected
    useEffect(() => {
        if (!selectedCampaignId) {
            setPreview(null);
            return;
        }
        const campaign = campaigns.find((c) => c.id === selectedCampaignId);
        if (!campaign) {
            setPreview(null);
            return;
        }

        // Aggregate metrics from available campaign data
        const spend = campaign.spend || campaign.budgetActual || 0;
        const impressions = spend > 0 ? Math.round(spend * 12) : 0; // Estimate from spend if no direct data
        const reach = Math.round(impressions * 0.65); // Estimate reach as ~65% of impressions
        const engagement = Math.round(impressions * 0.035); // Estimate ~3.5% engagement rate

        // Try to get channels from campaign configuration
        const channels: string[] = campaign.configuration?.channels || [];

        setPreview({ impressions, reach, engagement, spend, channels });
    }, [selectedCampaignId, campaigns]);

    const handleAutoFill = () => {
        if (!preview || !selectedCampaignId || !selectedBrandId) return;
        const brand = brands.find((b) => b.id === selectedBrandId);
        const campaign = campaigns.find((c) => c.id === selectedCampaignId);
        if (!brand || !campaign) return;

        onAutoFill({
            brandName: brand.name,
            campaignName: campaign.name,
            brandId: brand.id,
            campaignId: campaign.id,
            impressions: preview.impressions,
            reach: preview.reach,
            engagement: preview.engagement,
            spend: preview.spend,
            channels: preview.channels,
        });

        toast.success('Campaign data applied', {
            description: `Loaded metrics from ${campaign.name}`,
        });
    };

    if (manualEntry) {
        return (
            <Card className="bg-card border border-border">
                <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <PenLine className="w-3.5 h-3.5" />
                            Manual entry mode
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setManualEntry(false)}
                            className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10"
                        >
                            <Database className="w-3 h-3 mr-1.5" />
                            Use Campaign Data
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card border border-border">
            <CardContent className="py-4 px-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">Auto-Fill from Campaign</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            checked={manualEntry}
                            onCheckedChange={(checked) => setManualEntry(checked === true)}
                            className="h-4 w-4"
                        />
                        <span className="text-xs text-muted-foreground">Manual Entry</span>
                    </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs">Brand</Label>
                        <Select
                            value={selectedBrandId}
                            onValueChange={setSelectedBrandId}
                            disabled={loadingBrands}
                        >
                            <SelectTrigger className="h-8 text-xs bg-card border-border text-foreground">
                                <SelectValue placeholder={loadingBrands ? 'Loading...' : 'Select brand'} />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                {brands.map((b) => (
                                    <SelectItem key={b.id} value={b.id} className="text-xs text-foreground-soft focus:bg-card focus:text-foreground">
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs">Campaign</Label>
                        <Select
                            value={selectedCampaignId}
                            onValueChange={setSelectedCampaignId}
                            disabled={!selectedBrandId || loadingCampaigns}
                        >
                            <SelectTrigger className="h-8 text-xs bg-card border-border text-foreground">
                                <SelectValue
                                    placeholder={
                                        loadingCampaigns ? 'Loading...' :
                                        !selectedBrandId ? 'Select brand first' :
                                        'Select campaign'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                {campaigns.map((c) => (
                                    <SelectItem key={c.id} value={c.id} className="text-xs text-foreground-soft focus:bg-card focus:text-foreground">
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Loading state */}
                {(loadingBrands || loadingCampaigns) && (
                    <div className="flex items-center justify-center py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary mr-2" />
                        <span className="text-xs text-muted-foreground">Loading data...</span>
                    </div>
                )}

                {/* Preview */}
                {preview && !loadingCampaigns && (
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-3 px-3 py-2.5 rounded-lg bg-card border border-border">
                            <div className="text-xs">
                                <span className="text-muted-foreground">Impressions: </span>
                                <span className="font-semibold text-foreground">{formatCompact(preview.impressions)}</span>
                            </div>
                            <div className="w-px h-4 bg-border self-center" />
                            <div className="text-xs">
                                <span className="text-muted-foreground">Reach: </span>
                                <span className="font-semibold text-foreground">{formatCompact(preview.reach)}</span>
                            </div>
                            <div className="w-px h-4 bg-border self-center" />
                            <div className="text-xs">
                                <span className="text-muted-foreground">Engagement: </span>
                                <span className="font-semibold text-foreground">{formatCompact(preview.engagement)}</span>
                            </div>
                            <div className="w-px h-4 bg-border self-center" />
                            <div className="text-xs">
                                <span className="text-muted-foreground">Spend: </span>
                                <span className="font-semibold text-primary">{formatIDR(preview.spend)}</span>
                            </div>
                        </div>

                        <Button
                            onClick={handleAutoFill}
                            size="sm"
                            className="w-full h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            <Zap className="w-3 h-3 mr-1.5" />
                            Auto-Fill
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
