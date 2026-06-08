'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle, Play, Pause, Archive, FileText, GripVertical } from 'lucide-react';

// ─── Status Config ──────────────────────────────────────────────────────────

interface StatusColumn {
    id: string;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ElementType;
    accepts: string[]; // which statuses can drop into this column
}

const COLUMNS: StatusColumn[] = [
    {
        id: 'draft',
        label: 'Draft',
        color: '#8888aa',
        bgColor: 'rgba(136,136,170,0.08)',
        borderColor: 'rgba(136,136,170,0.2)',
        icon: FileText,
        accepts: ['rejected'], // only rejected can go back to draft
    },
    {
        id: 'pending_review',
        label: 'Pending Review',
        color: '#f59e0b',
        bgColor: 'rgba(245,158,11,0.08)',
        borderColor: 'rgba(245,158,11,0.2)',
        icon: Clock,
        accepts: ['draft'],
    },
    {
        id: 'approved',
        label: 'Approved',
        color: '#10b981',
        bgColor: 'rgba(16,185,129,0.08)',
        borderColor: 'rgba(16,185,129,0.2)',
        icon: CheckCircle,
        accepts: ['pending_review'],
    },
    {
        id: 'rejected',
        label: 'Rejected',
        color: '#ef4444',
        bgColor: 'rgba(239,68,68,0.08)',
        borderColor: 'rgba(239,68,68,0.2)',
        icon: XCircle,
        accepts: ['pending_review'],
    },
    {
        id: 'active',
        label: 'Active',
        color: '#0D9488',
        bgColor: 'rgba(13,148,136,0.08)',
        borderColor: 'rgba(13,148,136,0.2)',
        icon: Play,
        accepts: ['approved', 'paused'],
    },
    {
        id: 'paused',
        label: 'Paused',
        color: '#f97316',
        bgColor: 'rgba(249,115,22,0.08)',
        borderColor: 'rgba(249,115,22,0.2)',
        icon: Pause,
        accepts: ['active'],
    },
    {
        id: 'completed',
        label: 'Completed',
        color: '#6366f1',
        bgColor: 'rgba(99,102,241,0.08)',
        borderColor: 'rgba(99,102,241,0.2)',
        icon: Archive,
        accepts: ['active', 'paused'],
    },
];

// ─── Campaign Card ──────────────────────────────────────────────────────────

interface CampaignCardData {
    id: string;
    name: string;
    brandName?: string;
    approvalStatus: string;
    budgetPlanned?: number;
    startDate?: string;
    endDate?: string;
}

function DraggableCampaignCard({ campaign, onNavigate, activeBrandFilter }: { campaign: CampaignCardData; onNavigate: (id: string) => void; activeBrandFilter?: string }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: campaign.id,
        data: { campaign },
    });
    const justDragged = useRef(false);

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
    };

    // Track when a drag actually occurred so we can suppress navigation
    const handlePointerUp = useCallback(() => {
        if (isDragging) {
            justDragged.current = true;
        }
    }, [isDragging]);

    const handleCardClick = useCallback(() => {
        if (justDragged.current) {
            justDragged.current = false;
            return;
        }
        onNavigate(campaign.id);
    }, [campaign.id, onNavigate]);

    return (
        <div ref={setNodeRef} style={style} {...attributes} onPointerUp={handlePointerUp}
            className="bg-white/[0.06] border border-white/[0.08] rounded-lg p-3 hover:border-white/[0.12] hover:bg-white/[0.08] transition-colors group"
        >
            <div className="flex items-start gap-2">
                <div {...listeners} className="mt-0.5 text-white/20 group-hover:text-white/40 transition-colors cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={handleCardClick}>
                    <div className="text-sm font-semibold text-white truncate">{campaign.name}</div>
                    {campaign.brandName && (
                        <div className="text-xs text-white/40 mt-0.5 flex items-center gap-1.5">
                            {campaign.brandName}
                            {activeBrandFilter && activeBrandFilter === campaign.brandName && (
                                <span className="text-[9px] px-1 py-0.5 rounded bg-[#0D9488]/15 text-[#0D9488] font-medium leading-none">
                                    {activeBrandFilter}
                                </span>
                            )}
                        </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                        {campaign.budgetPlanned ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white/50">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(campaign.budgetPlanned)}
                            </span>
                        ) : null}
                        {campaign.startDate && (
                            <span className="text-[10px] text-white/30">
                                {new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        )}
                    </div>
                    <div className="text-[10px] text-white/0 group-hover:text-white/30 hover:!text-[#0D9488] transition-colors mt-1.5">
                        View →
                    </div>
                </div>
            </div>
        </div>
    );
}

function CampaignCardOverlay({ campaign }: { campaign: CampaignCardData }) {
    return (
        <div className="bg-white/[0.12] border border-[#0D9488]/40 rounded-lg p-3 shadow-xl shadow-black/30 w-[220px]">
            <div className="text-sm font-semibold text-white truncate">{campaign.name}</div>
            {campaign.brandName && <div className="text-xs text-white/40 mt-0.5">{campaign.brandName}</div>}
        </div>
    );
}

// ─── Droppable Column ───────────────────────────────────────────────────────

function KanbanColumn({ column, campaigns, isOver, onNavigate, activeBrandFilter }: { column: StatusColumn; campaigns: CampaignCardData[]; isOver: boolean; onNavigate: (id: string) => void; activeBrandFilter?: string }) {
    const { setNodeRef } = useDroppable({ id: column.id });
    const Icon = column.icon;

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col rounded-xl border transition-all min-w-[220px]`}
            style={{
                background: isOver ? column.bgColor : 'rgba(255,255,255,0.02)',
                borderColor: isOver ? column.color : 'rgba(255,255,255,0.06)',
                boxShadow: isOver ? `0 0 0 2px ${column.color}40` : 'none',
            }}
        >
            {/* Header */}
            <div className="px-3 py-2.5 border-b border-white/[0.06] flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" style={{ color: column.color }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: column.color }}>{column.label}</span>
                <Badge variant="outline" className="ml-auto text-[10px] h-5 border-white/10 text-white/40">
                    {campaigns.length}
                </Badge>
            </div>

            {/* Cards */}
            <div className="p-2 flex flex-col gap-2 min-h-[120px] flex-1">
                {campaigns.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                        <span className="text-xs text-white/20 italic">Drop campaigns here</span>
                    </div>
                )}
                {campaigns.map(c => (
                    <DraggableCampaignCard key={c.id} campaign={c} onNavigate={onNavigate} activeBrandFilter={activeBrandFilter} />
                ))}
            </div>
        </div>
    );
}

// ─── Main Kanban Component ──────────────────────────────────────────────────

interface ApprovalKanbanProps {
    campaigns: CampaignCardData[];
    onStatusChange: () => void;
    activeBrandFilter?: string;
}

export function ApprovalKanban({ campaigns, onStatusChange, activeBrandFilter }: ApprovalKanbanProps) {
    const router = useRouter();
    const [activeCard, setActiveCard] = useState<CampaignCardData | null>(null);
    const [overId, setOverId] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);
    const justDraggedGlobal = useRef(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const campaign = event.active.data.current?.campaign as CampaignCardData;
        setActiveCard(campaign);
    }, []);

    const handleDragOver = useCallback((event: any) => {
        setOverId(event.over?.id?.toString() || null);
    }, []);

    const handleNavigate = useCallback((campaignId: string) => {
        router.push(`/admin/campaign-detail/${campaignId}`);
    }, [router]);

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        setActiveCard(null);
        setOverId(null);
        justDraggedGlobal.current = true;
        // Reset after a tick so click handlers can check it
        setTimeout(() => { justDraggedGlobal.current = false; }, 0);

        const { active, over } = event;
        if (!over) return;

        const campaign = active.data.current?.campaign as CampaignCardData;
        const targetColumn = over.id as string;

        if (campaign.approvalStatus === targetColumn) return;

        // Check if transition is valid
        const column = COLUMNS.find(c => c.id === targetColumn);
        if (!column?.accepts.includes(campaign.approvalStatus)) {
            toast.error(`Cannot move from "${campaign.approvalStatus}" to "${targetColumn}"`);
            return;
        }

        setUpdating(campaign.id);
        try {
            await api.campaigns.updateStatus(campaign.id, targetColumn);
            toast.success(`"${campaign.name}" moved to ${column.label}`);
            onStatusChange();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update status');
        } finally {
            setUpdating(null);
        }
    }, [onStatusChange]);

    // Group campaigns by approval status
    const grouped = COLUMNS.reduce<Record<string, CampaignCardData[]>>((acc, col) => {
        acc[col.id] = campaigns.filter(c => (c.approvalStatus || 'draft') === col.id);
        return acc;
    }, {});

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-3 overflow-x-auto pb-4">
                {COLUMNS.map(col => (
                    <KanbanColumn
                        key={col.id}
                        column={col}
                        campaigns={grouped[col.id] || []}
                        isOver={overId === col.id}
                        onNavigate={handleNavigate}
                        activeBrandFilter={activeBrandFilter}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeCard ? <CampaignCardOverlay campaign={activeCard} /> : null}
            </DragOverlay>

            {updating && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-[#162032] border border-white/10 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-white/70">Updating status...</span>
                    </div>
                </div>
            )}
        </DndContext>
    );
}
