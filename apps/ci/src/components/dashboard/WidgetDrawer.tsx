'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, GripVertical, Plus, Check } from 'lucide-react';
import {
    WIDGET_REGISTRY,
    WIDGET_CATEGORIES,
    type WidgetDefinition,
} from '@/lib/widget-registry';
import {
    Target,
    DollarSign,
    Eye,
    TrendingUp,
    LineChart,
    List,
    Zap,
    Activity,
    GitPullRequestArrow,
    Gauge,
    Sparkles,
    Bell,
    Link2,
    Building2,
    BarChart3,
    type LucideIcon,
} from 'lucide-react';

// ─── Icon Map ──────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
    Target,
    DollarSign,
    Eye,
    TrendingUp,
    LineChart,
    List,
    Zap,
    Activity,
    GitPullRequestArrow,
    Gauge,
    Sparkles,
    Bell,
    Link2,
    Building2,
    BarChart3,
};

// ─── Props ─────────────────────────────────────────────────────────────────

interface WidgetDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onAddWidget?: (widgetId: string) => void;
    activeWidgetIds?: string[];
}

// ─── Size Label Helper ─────────────────────────────────────────────────────

function sizeLabel(w: number, h: number): string {
    if (w === 1 && h === 1) return 'Small';
    if (w <= 2 && h <= 1) return 'Medium';
    if (w <= 2 && h <= 2) return 'Large';
    return 'Full';
}

// ─── Category Label Map ────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
    all: 'All',
    metrics: 'Metrics',
    charts: 'Charts',
    campaigns: 'Campaigns',
    intelligence: 'Intelligence',
    platform: 'Platform',
};

// ─── Component ─────────────────────────────────────────────────────────────

export const WidgetDrawer: React.FC<WidgetDrawerProps> = ({
    isOpen,
    onClose,
    onAddWidget,
    activeWidgetIds = [],
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Filtered widgets based on search + category
    const filteredWidgets = useMemo(() => {
        let widgets = WIDGET_REGISTRY;

        // Category filter
        if (selectedCategory !== 'all') {
            widgets = widgets.filter((w) => w.category === selectedCategory);
        }

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            widgets = widgets.filter(
                (w) =>
                    w.name.toLowerCase().includes(q) ||
                    w.description.toLowerCase().includes(q)
            );
        }

        return widgets;
    }, [selectedCategory, searchQuery]);

    const activeSet = useMemo(() => new Set(activeWidgetIds), [activeWidgetIds]);

    // All category options: WIDGET_CATEGORIES plus 'all'
    const categoryTabs = useMemo(() => {
        return [
            { id: 'all', name: 'All' },
            ...WIDGET_CATEGORIES.map((cat) => ({
                id: cat,
                name: CATEGORY_LABELS[cat] ?? cat,
            })),
        ];
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background-2 z-40"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-[420px] max-w-[90vw] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Add Widget</h2>
                                <p className="text-sm text-foreground-soft mt-0.5">
                                    {WIDGET_REGISTRY.length} widgets available
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-card rounded-full transition-colors text-foreground-soft hover:text-foreground"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b border-border">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-soft" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search widgets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-card text-foreground placeholder:text-foreground-soft border border-border outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                />
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide border-b border-border">
                            {categoryTabs.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                                        selectedCategory === cat.id
                                            ? 'bg-primary/20 text-primary'
                                            : 'bg-card text-foreground-soft hover:bg-card/80 hover:text-foreground'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* Widget List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {filteredWidgets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2">
                                    <Search className="h-8 w-8 text-foreground-soft" />
                                    <p className="text-sm text-foreground-soft">No widgets found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {filteredWidgets.map((widget) => {
                                        const isAdded = activeSet.has(widget.id);
                                        const Icon = ICON_MAP[widget.icon] ?? Activity;

                                        return (
                                            <div
                                                key={widget.id}
                                                className={`group relative bg-card border rounded-xl p-4 transition-all ${
                                                    isAdded
                                                        ? 'border-primary/30 opacity-60'
                                                        : 'border-border hover:border-primary/40 hover:bg-card/80 cursor-pointer'
                                                }`}
                                                draggable={!isAdded}
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData('widgetId', widget.id);
                                                    e.dataTransfer.effectAllowed = 'copy';
                                                }}
                                            >
                                                <div className="flex flex-col gap-2.5">
                                                    {/* Icon + Category Badge */}
                                                    <div className="flex items-start justify-between">
                                                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Icon size={18} className="text-primary" />
                                                        </div>
                                                        {isAdded ? (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                                <Check size={10} /> Added
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-foreground-soft bg-card border border-border px-2 py-0.5 rounded-full capitalize">
                                                                {widget.category}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Name */}
                                                    <span className="text-xs font-bold text-foreground leading-tight">
                                                        {widget.name}
                                                    </span>

                                                    {/* Description */}
                                                    <p className="text-[10px] text-foreground-soft leading-relaxed line-clamp-2">
                                                        {widget.description}
                                                    </p>

                                                    {/* Size indicator */}
                                                    <span className="text-[10px] text-foreground-soft font-medium">
                                                        {sizeLabel(widget.defaultSize.w, widget.defaultSize.h)} &middot; {widget.defaultSize.w}x{widget.defaultSize.h}
                                                    </span>
                                                </div>

                                                {/* Drag handle */}
                                                {!isAdded && (
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-foreground-soft">
                                                        <GripVertical size={14} />
                                                    </div>
                                                )}

                                                {/* Add button */}
                                                {!isAdded && onAddWidget && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onAddWidget(widget.id);
                                                        }}
                                                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 group-hover:-bottom-1 transition-all shadow-lg flex items-center gap-1 hover:bg-primary/90"
                                                    >
                                                        <Plus size={10} /> Add
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-border bg-card">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-foreground-soft">
                                    {activeWidgetIds.length} of {WIDGET_REGISTRY.length} widgets active
                                </p>
                                <button
                                    onClick={onClose}
                                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
