'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Pencil, Trash2, ChevronRight, ChevronDown, Plus, Pause, Play, Archive, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, type Campaign } from '@/services/api';
import { useState, Fragment } from 'react';
import { toast } from 'sonner';

interface CampaignsTableProps {
    data: Campaign[];
    onConfigure: (campaign: Campaign) => void;
    onDelete: (campaignId: string) => void;
    onAddSubCampaign: (parentId: string) => void;
    onSelectCampaign: (campaign: Campaign) => void;
    onRefresh?: () => void;
}

export const CampaignsTable = ({ data, onConfigure, onDelete, onAddSubCampaign, onSelectCampaign, onRefresh }: CampaignsTableProps) => {
    // Group campaigns by parent
    const parents = data.filter(c => !c.parentId);
    const getChildren = (parentId: string) => data.filter(c => c.parentId === parentId);

    // Toggle state for expanding rows
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);

    const allParentIds = parents.map(p => p.id);
    const allSelected = parents.length > 0 && allParentIds.every(id => selectedIds.has(id));
    const someSelected = allParentIds.some(id => selectedIds.has(id));

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(allParentIds));
        }
    };

    const toggleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleBulkAction = async (action: string) => {
        if (action === 'archive' && !window.confirm(`Archive ${selectedIds.size} campaign(s)? This will remove them from active views.`)) {
            return;
        }
        setBulkLoading(true);
        try {
            await api.campaigns.bulkAction(action, [...selectedIds]);
            toast.success(`${selectedIds.size} campaign(s) ${action === 'pause' ? 'paused' : action === 'activate' ? 'activated' : 'archived'} successfully`);
            setSelectedIds(new Set());
            onRefresh?.();
        } catch (error) {
            console.error('Bulk action failed:', error);
            toast.error(`Failed to ${action} campaigns`);
        } finally {
            setBulkLoading(false);
        }
    };

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getStatusBadge = (status: Campaign['status']) => {
        const s = status?.toLowerCase() || 'draft';
        switch (s) {
            case 'active': return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
            case 'paused': return <Badge className="bg-warning/10 text-warning border-warning/20">Paused</Badge>;
            case 'completed': return <Badge variant="secondary" className="bg-card text-foreground-soft">Completed</Badge>;
            default: return <Badge variant="outline" className="text-foreground-soft">Draft</Badge>;
        }
    };

    const BudgetCell = ({ campaign }: { campaign: Campaign }) => {
        const planned = campaign.budgetPlanned || 0;
        const spent = campaign.spend || 0;

        return (
            <div className="flex gap-8 text-sm">
                <div className="space-y-0.5">
                    <div className="text-xs text-foreground-soft font-medium uppercase tracking-wider">Planned</div>
                    <div className="font-semibold text-foreground">{planned > 0 ? planned.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : '-'}</div>
                </div>
                <div className="space-y-0.5">
                    <div className="text-xs text-foreground-soft font-medium uppercase tracking-wider">Spent</div>
                    <div className="font-semibold text-foreground">{spent > 0 ? spent.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : '-'}</div>
                </div>
            </div>
        )
    };

    const ProgressCell = ({ campaign }: { campaign: Campaign }) => {
        const planned = campaign.budgetPlanned || 0;
        const spent = campaign.spend || 0;
        const percent = planned > 0 ? Math.min((spent / planned) * 100, 100) : 0;

        return (
            <div className="w-[120px] space-y-2">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground-soft font-medium">{percent.toFixed(0)}%</span>
                </div>
                <Progress value={percent} className="h-2 bg-card" />
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Bulk Actions Toolbar */}
            {selectedIds.size > 0 && (
                <div className="flex items-center justify-between gap-4 px-4 py-3 bg-primary/10 border-b border-primary/20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <span className="text-sm font-semibold text-primary">
                        {selectedIds.size} campaign{selectedIds.size > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={bulkLoading}
                            className="h-8 border-warning/30 text-warning hover:bg-warning/10 hover:border-warning/40 bg-transparent"
                            onClick={() => handleBulkAction('pause')}
                        >
                            <Pause className="h-3.5 w-3.5 mr-1.5" /> Pause
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={bulkLoading}
                            className="h-8 border-success/30 text-success hover:bg-success/10 hover:border-success/40 bg-transparent"
                            onClick={() => handleBulkAction('activate')}
                        >
                            <Play className="h-3.5 w-3.5 mr-1.5" /> Activate
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={bulkLoading}
                            className="h-8 border-border text-foreground-soft hover:bg-card hover:border-border bg-transparent"
                            onClick={() => handleBulkAction('archive')}
                        >
                            <Archive className="h-3.5 w-3.5 mr-1.5" /> Archive
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            disabled={bulkLoading}
                            className="h-8 text-foreground-soft hover:text-foreground hover:bg-card"
                            onClick={() => setSelectedIds(new Set())}
                        >
                            <X className="h-3.5 w-3.5 mr-1.5" /> Clear
                        </Button>
                    </div>
                </div>
            )}
            <Table>
                <TableHeader>
                    <TableRow className="border-border bg-card hover:bg-card">
                        <TableHead className="w-[40px] px-3">
                            <Checkbox
                                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                onCheckedChange={toggleSelectAll}
                                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                        </TableHead>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead className="w-[300px] text-foreground-soft font-semibold">Campaign / Service</TableHead>
                        <TableHead className="text-foreground-soft font-semibold">Market</TableHead>
                        <TableHead className="text-foreground-soft font-semibold">Objective</TableHead>
                        <TableHead className="text-foreground-soft font-semibold">Status</TableHead>
                        <TableHead className="text-foreground-soft font-semibold">Budget</TableHead>
                        <TableHead className="text-foreground-soft font-semibold">Progress</TableHead>
                        <TableHead className="text-right text-foreground-soft font-semibold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {parents.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center py-12 text-foreground-soft">
                                No campaigns found. Create one to get started.
                            </TableCell>
                        </TableRow>
                    )}

                    {parents.map((parent) => {
                        const children = getChildren(parent.id);
                        const isExpanded = expanded[parent.id];

                        return (
                            <Fragment key={parent.id}>
                                {/* PARENT ROW */}
                                <TableRow
                                    className={`border-border hover:bg-card cursor-pointer transition-colors group ${selectedIds.has(parent.id) ? 'bg-primary/5' : ''}`}
                                    onClick={() => onSelectCampaign(parent)}
                                >
                                    <TableCell className="px-3" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedIds.has(parent.id)}
                                            onCheckedChange={() => {
                                                setSelectedIds(prev => {
                                                    const next = new Set(prev);
                                                    if (next.has(parent.id)) {
                                                        next.delete(parent.id);
                                                    } else {
                                                        next.add(parent.id);
                                                    }
                                                    return next;
                                                });
                                            }}
                                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {children.length > 0 && (
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-foreground-soft hover:text-foreground hover:bg-card" onClick={(e) => toggleExpand(parent.id, e)}>
                                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            </Button>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {parent.name}
                                    </TableCell>
                                    <TableCell>
                                        {parent.marketCode ? <Badge variant="outline" className="border-border text-foreground-soft bg-card">{parent.marketCode}</Badge> : <span className="text-foreground-soft">-</span>}
                                    </TableCell>
                                    <TableCell>
                                        {parent.objective ? <span className="text-sm text-foreground-soft font-medium">{parent.objective}</span> : <span className="text-foreground-soft">-</span>}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(parent.status)}</TableCell>
                                    <TableCell>
                                        <BudgetCell campaign={parent} />
                                    </TableCell>
                                    <TableCell>
                                        <ProgressCell campaign={parent} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/30 bg-primary/5"
                                                onClick={() => onAddSubCampaign(parent.id)}
                                            >
                                                <Plus className="h-3.5 w-3.5 mr-1" /> Sub
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-foreground-soft hover:text-foreground hover:bg-card">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={() => onConfigure(parent)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onDelete(parent.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>

                                {/* CHILD ROWS */}
                                {isExpanded && children.map(child => (
                                    <TableRow
                                        key={child.id}
                                        className="border-border bg-card hover:bg-card cursor-pointer"
                                        onClick={() => onSelectCampaign(child)}
                                    >
                                        <TableCell className="px-3"></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell className="pl-6 relative">
                                            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-border" />
                                            <div className="flex items-center gap-3">
                                                <div className="h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center text-foreground-soft">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-foreground-soft" />
                                                </div>
                                                <span className="text-foreground-soft font-medium text-sm">{child.serviceType || child.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-foreground-soft text-xs font-medium">{child.marketCode || parent.marketCode}</span>
                                        </TableCell>
                                        <TableCell>
                                            {child.objective ? <span className="text-xs text-foreground-soft bg-card border border-border px-2 py-1 rounded-sm">{child.objective}</span> : <span className="text-foreground-soft">-</span>}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(child.status)}</TableCell>
                                        <TableCell>
                                            <BudgetCell campaign={child} />
                                        </TableCell>
                                        <TableCell>
                                            <ProgressCell campaign={child} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-7 w-7 p-0 text-foreground-soft hover:text-foreground">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => onConfigure(child)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit Service
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onDelete(child.id)} className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </Fragment>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    );
};
