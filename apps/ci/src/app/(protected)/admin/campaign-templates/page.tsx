'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutTemplate,
    Plus,
    Pencil,
    Trash2,
    Layers,
    DollarSign,
    Calendar,
    Globe,
    X,
} from 'lucide-react';
import { api, type Brand, type Channel } from '@/services/api';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// ---------- Types ----------

interface TemplateStructure {
    channels: string[];
    subCampaigns: { name: string; type: string; budget?: number }[];
    budgetSplits: { total: number };
}

interface CampaignTemplate {
    id: string;
    name: string;
    description?: string;
    brandId?: string | null;
    brand?: Brand | null;
    structure: string; // JSON string of TemplateStructure
    createdAt: string;
    updatedAt: string;
}

// ---------- Helpers ----------

function parseStructure(raw: string): TemplateStructure {
    try {
        return JSON.parse(raw);
    } catch {
        return { channels: [], subCampaigns: [], budgetSplits: { total: 0 } };
    }
}

function relativeDate(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

function formatBudget(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
}

// ---------- Empty State ----------

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-6">
                <LayoutTemplate className="h-10 w-10 text-foreground/20" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No templates yet</h3>
            <p className="text-sm text-foreground/40 max-w-md mb-8">
                Create your first template to speed up campaign creation. Templates save channel configurations, sub-campaign structures, and budget allocations for reuse.
            </p>
            <button
                onClick={onCreateClick}
                className="flex items-center gap-2 px-6 py-2.5 bg-[hsl(var(--primary))] text-foreground rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-[hsl(var(--primary))]/10"
            >
                <Plus className="h-4 w-4" /> CREATE FIRST TEMPLATE
            </button>
        </div>
    );
}

// ---------- Template Card ----------

function TemplateCard({
    template,
    onUse,
    onEdit,
    onDelete,
}: {
    template: CampaignTemplate;
    onUse: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const structure = parseStructure(template.structure);
    const isGlobal = !template.brandId;

    return (
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 group hover:border-border transition-all">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">{template.name}</h3>
                    {template.description && (
                        <p className="text-xs text-foreground/40 mt-1 line-clamp-2">{template.description}</p>
                    )}
                </div>
                {isGlobal ? (
                    <Badge variant="outline" className="shrink-0 border-[hsl(var(--primary))]/30 text-[hsl(var(--primary))] text-[9px] font-bold uppercase">
                        <Globe className="h-3 w-3 mr-1" /> Global
                    </Badge>
                ) : (
                    <Badge variant="outline" className="shrink-0 border-border text-foreground/50 text-[9px] font-bold uppercase truncate max-w-[100px]">
                        {template.brand?.name || 'Brand'}
                    </Badge>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-card rounded-lg text-center">
                    <p className="text-[9px] font-bold text-foreground/40 uppercase">Channels</p>
                    <p className="text-sm font-black text-foreground">{structure.channels.length}</p>
                </div>
                <div className="p-2 bg-card rounded-lg text-center">
                    <p className="text-[9px] font-bold text-foreground/40 uppercase">Sub-camps</p>
                    <p className="text-sm font-black text-foreground">{structure.subCampaigns.length}</p>
                </div>
                <div className="p-2 bg-card rounded-lg text-center">
                    <p className="text-[9px] font-bold text-foreground/40 uppercase">Budget</p>
                    <p className="text-sm font-black text-foreground">{formatBudget(structure.budgetSplits.total)}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-[10px] text-foreground/30 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {relativeDate(template.createdAt)}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onEdit}
                        className="p-1.5 rounded-lg hover:bg-card text-foreground/40 hover:text-foreground/70 transition-all"
                        title="Edit template"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 rounded-lg hover:bg-destructive text-foreground/40 hover:text-destructive transition-all"
                        title="Delete template"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={onUse}
                        className="ml-1 flex items-center gap-1.5 px-3 py-1.5 bg-[hsl(var(--primary))] text-foreground rounded-lg font-bold text-[10px] hover:bg-primary/90 transition-all shadow-sm shadow-[hsl(var(--primary))]/10"
                    >
                        <Layers className="h-3 w-3" /> USE
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---------- Create / Edit Template Dialog ----------

function CreateTemplateDialog({
    open,
    onOpenChange,
    onSuccess,
    brands,
    channels,
    editingTemplate,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    brands: Brand[];
    channels: Channel[];
    editingTemplate: CampaignTemplate | null;
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isGlobal, setIsGlobal] = useState(true);
    const [brandId, setBrandId] = useState('');
    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
    const [subCampaigns, setSubCampaigns] = useState<{ name: string; type: string }[]>([]);
    const [totalBudget, setTotalBudget] = useState('');
    const [saving, setSaving] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (editingTemplate) {
            setName(editingTemplate.name);
            setDescription(editingTemplate.description || '');
            setIsGlobal(!editingTemplate.brandId);
            setBrandId(editingTemplate.brandId || '');
            const structure = parseStructure(editingTemplate.structure);
            setSelectedChannels(structure.channels);
            setSubCampaigns(structure.subCampaigns.map(sc => ({ name: sc.name, type: sc.type })));
            setTotalBudget(structure.budgetSplits.total > 0 ? String(structure.budgetSplits.total) : '');
        } else {
            resetForm();
        }
    }, [editingTemplate, open]);

    function resetForm() {
        setName('');
        setDescription('');
        setIsGlobal(true);
        setBrandId('');
        setSelectedChannels([]);
        setSubCampaigns([]);
        setTotalBudget('');
    }

    function toggleChannel(channelId: string) {
        setSelectedChannels(prev =>
            prev.includes(channelId)
                ? prev.filter(c => c !== channelId)
                : [...prev, channelId]
        );
    }

    function addSubCampaign() {
        setSubCampaigns(prev => [...prev, { name: '', type: '' }]);
    }

    function removeSubCampaign(index: number) {
        setSubCampaigns(prev => prev.filter((_, i) => i !== index));
    }

    function updateSubCampaign(index: number, field: 'name' | 'type', value: string) {
        setSubCampaigns(prev =>
            prev.map((sc, i) => (i === index ? { ...sc, [field]: value } : sc))
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Template name is required');
            return;
        }

        const structure: TemplateStructure = {
            channels: selectedChannels,
            subCampaigns: subCampaigns.filter(sc => sc.name.trim()),
            budgetSplits: { total: Number(totalBudget) || 0 },
        };

        const payload = {
            name: name.trim(),
            description: description.trim() || undefined,
            brandId: isGlobal ? null : brandId || null,
            structure: JSON.stringify(structure),
        };

        setSaving(true);
        try {
            if (editingTemplate) {
                await api.campaignTemplates.update(editingTemplate.id, payload);
                toast.success('Template updated');
            } else {
                await api.campaignTemplates.create(payload as any);
                toast.success('Template created');
            }
            onOpenChange(false);
            resetForm();
            onSuccess();
        } catch {
            toast.error('Failed to save template');
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-[#0B1120] border-border text-foreground max-h-[85vh] overflow-y-auto">
                <DialogTitle className="text-lg font-bold">
                    {editingTemplate ? 'Edit Template' : 'Create Template'}
                </DialogTitle>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Name & Description */}
                    <div className="space-y-3">
                        <div>
                            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                Template Name *
                            </Label>
                            <Input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Standard Brand Launch"
                                className="mt-1.5 bg-card border-border"
                                required
                            />
                        </div>
                        <div>
                            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                Description
                            </Label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Brief description of when to use this template..."
                                rows={2}
                                className="mt-1.5 w-full px-3 py-2 text-sm bg-card border border-border rounded-md text-foreground placeholder:text-foreground/20 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/40 resize-none"
                            />
                        </div>
                    </div>

                    {/* Brand Assignment */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                            Brand Assignment
                        </Label>
                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="global-check"
                                checked={isGlobal}
                                onCheckedChange={(checked) => {
                                    setIsGlobal(!!checked);
                                    if (checked) setBrandId('');
                                }}
                            />
                            <label htmlFor="global-check" className="text-xs text-foreground/60 cursor-pointer">
                                Global template (available to all brands)
                            </label>
                        </div>
                        {!isGlobal && (
                            <Select value={brandId} onValueChange={setBrandId}>
                                <SelectTrigger className="bg-card border-border text-foreground">
                                    <SelectValue placeholder="Select a brand" />
                                </SelectTrigger>
                                <SelectContent className="bg-[hsl(var(--background-2))] border-border">
                                    {brands.map(brand => (
                                        <SelectItem key={brand.id} value={brand.id} className="text-foreground/70 focus:bg-card focus:text-foreground">
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Channels */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                            Channels
                        </Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {channels.map(channel => (
                                <label
                                    key={channel.id}
                                    className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border cursor-pointer hover:bg-card transition-all"
                                >
                                    <Checkbox
                                        checked={selectedChannels.includes(channel.id)}
                                        onCheckedChange={() => toggleChannel(channel.id)}
                                    />
                                    <span className="text-xs text-foreground/70">{channel.name}</span>
                                </label>
                            ))}
                            {channels.length === 0 && (
                                <p className="col-span-full text-xs text-foreground/30 italic">No channels available</p>
                            )}
                        </div>
                    </div>

                    {/* Sub-Campaigns */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                Sub-Campaigns
                            </Label>
                            <button
                                type="button"
                                onClick={addSubCampaign}
                                className="text-[10px] font-bold text-[hsl(var(--primary))] hover:text-[#0F766E] transition-colors flex items-center gap-1"
                            >
                                <Plus className="h-3 w-3" /> ADD ROW
                            </button>
                        </div>
                        {subCampaigns.length === 0 && (
                            <p className="text-xs text-foreground/30 italic">No sub-campaigns added. Click &quot;Add Row&quot; above.</p>
                        )}
                        <div className="space-y-2">
                            {subCampaigns.map((sc, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Input
                                        value={sc.name}
                                        onChange={e => updateSubCampaign(idx, 'name', e.target.value)}
                                        placeholder="Sub-campaign name"
                                        className="flex-1 bg-card border-border text-xs"
                                    />
                                    <Input
                                        value={sc.type}
                                        onChange={e => updateSubCampaign(idx, 'type', e.target.value)}
                                        placeholder="Type (e.g. Awareness)"
                                        className="flex-1 bg-card border-border text-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSubCampaign(idx)}
                                        className="p-1.5 rounded-lg hover:bg-destructive text-foreground/30 hover:text-destructive transition-all shrink-0"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Budget */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                            Total Planned Budget
                        </Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/30" />
                            <Input
                                type="number"
                                value={totalBudget}
                                onChange={e => setTotalBudget(e.target.value)}
                                placeholder="0"
                                min={0}
                                className="pl-8 bg-card border-border"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-foreground/50 hover:text-foreground/70"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving || !name.trim()}
                            className="bg-[hsl(var(--primary))] hover:bg-primary/90 text-foreground font-bold"
                        >
                            {saving ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ---------- Use Template Dialog ----------

function UseTemplateDialog({
    open,
    onOpenChange,
    template,
    brands,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: CampaignTemplate | null;
    brands: Brand[];
}) {
    const router = useRouter();
    const [campaignName, setCampaignName] = useState('');
    const [brandId, setBrandId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (open) {
            setCampaignName('');
            setBrandId(template?.brandId || '');
            setStartDate('');
            setEndDate('');
        }
    }, [open, template]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!template || !campaignName.trim() || !brandId) {
            toast.error('Campaign name and brand are required');
            return;
        }

        setCreating(true);
        try {
            await api.campaignTemplates.createFromTemplate({
                templateId: template.id,
                brandId,
                name: campaignName.trim(),
            });
            toast.success('Campaign created from template');
            onOpenChange(false);
            router.push('/admin/brand-campaign-settings');
        } catch {
            toast.error('Failed to create campaign from template');
        } finally {
            setCreating(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-[#0B1120] border-border text-foreground">
                <DialogTitle className="text-lg font-bold">
                    Use Template: {template?.name}
                </DialogTitle>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div>
                        <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                            Campaign Name *
                        </Label>
                        <Input
                            value={campaignName}
                            onChange={e => setCampaignName(e.target.value)}
                            placeholder="e.g. Q2 2026 Brand Launch"
                            className="mt-1.5 bg-card border-border"
                            required
                        />
                    </div>

                    <div>
                        <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                            Brand *
                        </Label>
                        <Select value={brandId} onValueChange={setBrandId}>
                            <SelectTrigger className="mt-1.5 bg-card border-border text-foreground">
                                <SelectValue placeholder="Select a brand" />
                            </SelectTrigger>
                            <SelectContent className="bg-[hsl(var(--background-2))] border-border">
                                {brands.map(brand => (
                                    <SelectItem key={brand.id} value={brand.id} className="text-foreground/70 focus:bg-card focus:text-foreground">
                                        {brand.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                Start Date
                            </Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="mt-1.5 bg-card border-border"
                            />
                        </div>
                        <div>
                            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                End Date
                            </Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="mt-1.5 bg-card border-border"
                            />
                        </div>
                    </div>

                    {/* Template structure preview */}
                    {template && (
                        <div className="bg-card border border-border rounded-lg p-3 space-y-1.5">
                            <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-wider">
                                Template includes
                            </div>
                            {(() => {
                                const s = parseStructure(template.structure);
                                return (
                                    <div className="text-xs text-foreground/50">
                                        {s.channels.length} channel{s.channels.length !== 1 ? 's' : ''},{' '}
                                        {s.subCampaigns.length} sub-campaign{s.subCampaigns.length !== 1 ? 's' : ''}
                                        {s.budgetSplits.total > 0
                                            ? `, ${formatBudget(s.budgetSplits.total)} budget`
                                            : ''}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-foreground/50 hover:text-foreground/70"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={creating || !campaignName.trim() || !brandId}
                            className="bg-[hsl(var(--primary))] hover:bg-primary/90 text-foreground font-bold"
                        >
                            {creating ? 'Creating...' : 'Create Campaign'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ---------- Main Page ----------

export default function CampaignTemplatesPage() {
    const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [createOpen, setCreateOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<CampaignTemplate | null>(null);
    const [useTemplate, setUseTemplate] = useState<CampaignTemplate | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CampaignTemplate | null>(null);

    const fetchTemplates = useCallback(async () => {
        try {
            const data = await api.campaignTemplates.getAll();
            setTemplates(data);
        } catch {
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
        api.brands.getAll().then(setBrands).catch(() => {});
        api.channels.getAll().then(setChannels).catch(() => {});
    }, [fetchTemplates]);

    async function handleConfirmDelete() {
        if (!deleteTarget) return;
        try {
            await api.campaignTemplates.delete(deleteTarget.id);
            toast.success('Template deleted');
            setDeleteTarget(null);
            fetchTemplates();
        } catch {
            toast.error('Failed to delete template');
        }
    }

    function handleEdit(template: CampaignTemplate) {
        setEditingTemplate(template);
        setCreateOpen(true);
    }

    function handleCloseCreateDialog(open: boolean) {
        setCreateOpen(open);
        if (!open) setEditingTemplate(null);
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · Campaign Templates
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    Campaign Templates
                </h1>
                <div className="mt-6"><button
                        onClick={() => { setEditingTemplate(null); setCreateOpen(true); }}
                        className="flex items-center gap-2 px-6 py-2 bg-[hsl(var(--primary))] text-foreground rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-[hsl(var(--primary))]/10"
                    >
                        <Plus className="h-4 w-4" /> NEW TEMPLATE
                    </button></div>
            </header>

            {/* Content */}
            {loading ? (
                <div className="h-64 bg-card border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-4 text-foreground/40">
                    <LayoutTemplate className="h-8 w-8 animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-widest">Loading templates...</p>
                </div>
            ) : templates.length === 0 ? (
                <EmptyState onCreateClick={() => { setEditingTemplate(null); setCreateOpen(true); }} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map(template => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onUse={() => setUseTemplate(template)}
                            onEdit={() => handleEdit(template)}
                            onDelete={() => setDeleteTarget(template)}
                        />
                    ))}
                </div>
            )}

            {/* Dialogs */}
            <CreateTemplateDialog
                open={createOpen}
                onOpenChange={handleCloseCreateDialog}
                onSuccess={fetchTemplates}
                brands={brands}
                channels={channels}
                editingTemplate={editingTemplate}
            />

            <UseTemplateDialog
                open={!!useTemplate}
                onOpenChange={(open) => { if (!open) setUseTemplate(null); }}
                template={useTemplate}
                brands={brands}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <DialogContent className="max-w-sm bg-[#0B1120] border-border text-foreground">
                    <DialogTitle className="text-lg font-bold">Delete Template</DialogTitle>
                    <p className="text-sm text-foreground/40 mt-1">
                        This action cannot be undone. The template <span className="text-foreground/70 font-medium">&quot;{deleteTarget?.name}&quot;</span> will be permanently removed.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setDeleteTarget(null)}
                            className="text-foreground/50 hover:text-foreground/70"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmDelete}
                            className="bg-destructive hover:bg-destructive text-foreground font-bold"
                        >
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
