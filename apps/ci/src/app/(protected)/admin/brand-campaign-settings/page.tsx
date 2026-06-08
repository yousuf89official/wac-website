'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCcw } from 'lucide-react';
import { api, type Brand, type Campaign } from '@/services/api';
import { CampaignsTable } from '@/components/brands/CampaignsTable';
import { CreateCampaignDialog } from '@/components/brands/CreateCampaignDialog';
import { CreateSubCampaignDialog } from '@/components/brands/CreateSubCampaignDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function BrandCampaignSettingsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [selectedBrandId, setSelectedBrandId] = useState<string>('');
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [isCreateUmbrellaOpen, setIsCreateUmbrellaOpen] = useState(false);
    const [subCampaignConfig, setSubCampaignConfig] = useState<{ open: boolean; parentId: string; parentName: string }>({
        open: false,
        parentId: '',
        parentName: ''
    });

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const data = await api.brands.getAll();
                setBrands(data);
                if (data.length > 0) {
                    setSelectedBrandId(data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch brands", error);
                toast.error("Failed to load brands roster");
            }
        };
        fetchBrands();
    }, []);

    const fetchCampaigns = useCallback(async () => {
        if (!selectedBrandId) return;
        setLoading(true);
        try {
            const data = await api.campaigns.getAll({ brandId: selectedBrandId });
            setCampaigns(data);
        } catch (error) {
            console.error("Failed to fetch campaigns", error);
            toast.error("Failed to sync campaigns");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [selectedBrandId]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchCampaigns();
    };

    const handleDeleteCampaign = async (id: string) => {
        try {
            await api.campaigns.delete(id);
            toast.success("Campaign eliminated");
            fetchCampaigns();
        } catch (error) {
            console.error(error);
            toast.error("Delete operation rejected by server");
        }
    };

    const handleAddSubCampaign = (parentId: string) => {
        const parent = campaigns.find(c => c.id === parentId);
        if (parent) {
            setSubCampaignConfig({
                open: true,
                parentId: parent.id,
                parentName: parent.name
            });
        }
    };

    const selectedBrand = brands.find(b => b.id === selectedBrandId);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · Campaign Orchestration
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    Campaign Orchestration
                </h1>
                <p className="mt-4 text-foreground-soft max-w-2xl">
                    Manage global umbrella campaigns and execution-level services.
                </p>
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground-soft rounded-xl font-bold text-xs hover:bg-card transition-all shadow-sm"
                    >
                        <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} /> REFRESH
                    </button>
                    <button
                        onClick={() => setIsCreateUmbrellaOpen(true)}
                        disabled={!selectedBrandId}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-foreground rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" /> NEW UMBRELLA
                    </button>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Brand Selection Sidebar/Panel */}
                <div className="w-full md:w-64 space-y-4">
                    <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground-soft">Target Brand</Label>
                            <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
                                <SelectTrigger className="w-full bg-card border-border text-foreground">
                                    <SelectValue placeholder="Select Brand" />
                                </SelectTrigger>
                                <SelectContent className="bg-background-2 border-border">
                                    {brands.map(brand => (
                                        <SelectItem key={brand.id} value={brand.id} className="text-foreground-soft focus:bg-card focus:text-foreground">
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedBrand && (
                            <div className="pt-4 border-t border-border space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center p-1.5">
                                        <img
                                            src={selectedBrand.logo || '/assets/placeholder-logo.png'}
                                            alt={selectedBrand.name}
                                            className="h-full w-auto object-contain brightness-0 invert"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-foreground truncate max-w-[120px]">{selectedBrand.name}</p>
                                        <p className="text-[9px] text-foreground-soft font-bold uppercase tracking-tight">{selectedBrand.industryType || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2 bg-card rounded-lg text-center">
                                        <p className="text-[9px] font-bold text-foreground-soft uppercase">Campaigns</p>
                                        <p className="text-sm font-black text-foreground">{campaigns.filter(c => !c.parentId).length}</p>
                                    </div>
                                    <div className="p-2 bg-card rounded-lg text-center">
                                        <p className="text-[9px] font-bold text-foreground-soft uppercase">Services</p>
                                        <p className="text-sm font-black text-foreground">{campaigns.filter(c => !!c.parentId).length}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content: Campaigns Table */}
                <div className="flex-1 min-w-0">
                    {loading ? (
                        <div className="h-64 bg-card border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-4 text-foreground-soft">
                            <RefreshCcw className="h-8 w-8 animate-spin" />
                            <p className="text-xs font-bold uppercase tracking-widest">Synchronizing Operations Registry...</p>
                        </div>
                    ) : (
                        <CampaignsTable
                            data={campaigns}
                            onConfigure={(c) => toast.info(`Configuring ${c.name}`)}
                            onDelete={(id) => handleDeleteCampaign(id)}
                            onAddSubCampaign={handleAddSubCampaign}
                            onSelectCampaign={(c) => toast.info(`Selected ${c.name}`)}
                            onRefresh={fetchCampaigns}
                        />
                    )}
                </div>
            </div>

            {/* Modals */}
            {selectedBrandId && (
                <>
                    <CreateCampaignDialog
                        brandId={selectedBrandId}
                        open={isCreateUmbrellaOpen}
                        onOpenChange={setIsCreateUmbrellaOpen}
                        onSuccess={fetchCampaigns}
                    />
                    <CreateSubCampaignDialog
                        brandId={selectedBrandId}
                        parentId={subCampaignConfig.parentId}
                        parentName={subCampaignConfig.parentName}
                        open={subCampaignConfig.open}
                        onOpenChange={(open) => setSubCampaignConfig(prev => ({ ...prev, open }))}
                        onSuccess={fetchCampaigns}
                    />
                </>
            )}
        </div>
    );
}
