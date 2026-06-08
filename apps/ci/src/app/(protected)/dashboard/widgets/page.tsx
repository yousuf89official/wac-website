'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { WidgetGrid } from '@/components/dashboard/WidgetGrid';
import { WidgetDrawer } from '@/components/dashboard/WidgetDrawer';
import {
    PRESET_LAYOUTS,
    LAYOUT_STORAGE_KEY,
    getWidgetById,
    type WidgetLayoutItem,
} from '@/lib/widget-registry';
import { Pencil, Check, Save, Plus, PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const ease = [0.16, 1, 0.3, 1] as const;

// ─── Helpers ───────────────────────────────────────────────────────────────

function findNextPosition(
    layout: WidgetLayoutItem[],
    w: number,
    h: number,
    cols = 4,
): { x: number; y: number } {
    if (layout.length === 0) return { x: 0, y: 0 };

    const maxY = layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
    const grid: boolean[][] = Array.from({ length: maxY + h + 1 }, () =>
        Array(cols).fill(false),
    );

    for (const item of layout) {
        for (let row = item.y; row < item.y + item.h; row++) {
            for (let col = item.x; col < item.x + item.w; col++) {
                if (grid[row]) grid[row][col] = true;
            }
        }
    }

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col <= cols - w; col++) {
            let fits = true;
            for (let dr = 0; dr < h && fits; dr++) {
                for (let dc = 0; dc < w && fits; dc++) {
                    if (grid[row + dr]?.[col + dc]) fits = false;
                }
            }
            if (fits) return { x: col, y: row };
        }
    }

    return { x: 0, y: maxY };
}

// ─── Page Component ────────────────────────────────────────────────────────

export default function WidgetsPage() {
    const [layout, setLayout] = useState<WidgetLayoutItem[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<string>('default');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [mounted, setMounted] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setLayout(parsed);
                    setSelectedPreset('custom');
                    setMounted(true);
                    return;
                }
            }
        } catch {
            // ignore parse errors
        }
        setLayout(PRESET_LAYOUTS.default.widgets);
        setMounted(true);
    }, []);

    const persistLayout = useCallback((newLayout: WidgetLayoutItem[]) => {
        try {
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(newLayout));
        } catch {
            // localStorage full or unavailable
        }

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        setSaveStatus('saving');
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await fetch('/api/dashboard-layouts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ layout: newLayout }),
                });
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            } catch {
                setSaveStatus('idle');
            }
        }, 1000);
    }, []);

    const handleLayoutChange = useCallback(
        (newLayout: WidgetLayoutItem[]) => {
            setLayout(newLayout);
            setSelectedPreset('custom');
            persistLayout(newLayout);
        },
        [persistLayout],
    );

    const handleRemoveWidget = useCallback(
        (widgetId: string) => {
            setLayout((prev) => {
                const next = prev.filter((item) => item.widgetId !== widgetId);
                persistLayout(next);
                setSelectedPreset('custom');
                return next;
            });
            const def = getWidgetById(widgetId);
            toast.success(`Removed "${def?.name ?? widgetId}"`);
        },
        [persistLayout],
    );

    const handleAddWidget = useCallback(
        (widgetId: string) => {
            if (layout.some((item) => item.widgetId === widgetId)) {
                toast.info('Widget already on dashboard');
                return;
            }

            const def = getWidgetById(widgetId);
            if (!def) return;

            const { x, y } = findNextPosition(layout, def.defaultSize.w, def.defaultSize.h);
            const newItem: WidgetLayoutItem = {
                widgetId,
                x,
                y,
                w: def.defaultSize.w,
                h: def.defaultSize.h,
            };

            const newLayout = [...layout, newItem];
            setLayout(newLayout);
            setSelectedPreset('custom');
            persistLayout(newLayout);
            toast.success(`Added "${def.name}"`);
        },
        [layout, persistLayout],
    );

    const handlePresetChange = useCallback(
        (presetKey: string) => {
            if (presetKey === 'custom') return;
            const preset = PRESET_LAYOUTS[presetKey];
            if (!preset) return;

            setSelectedPreset(presetKey);
            setLayout(preset.widgets);
            persistLayout(preset.widgets);
            toast.success(`Applied "${preset.name}" layout`);
        },
        [persistLayout],
    );

    const handleSave = useCallback(() => {
        persistLayout(layout);
        toast.success('Layout saved');
    }, [layout, persistLayout]);

    const activeWidgetIds = layout.map((item) => item.widgetId);

    const headerActions = (
        <div className="flex flex-wrap items-center gap-3">
            {saveStatus === 'saving' && (
                <span className="animate-pulse font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                    Saving…
                </span>
            )}
            {saveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-widest text-success">
                    <Check className="h-3 w-3" /> Saved
                </span>
            )}

            <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger className="h-9 w-[160px] rounded-none border-0 border-b border-border bg-transparent font-mono text-2xs uppercase tracking-widest text-foreground focus:ring-0">
                    <SelectValue placeholder="Select preset" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(PRESET_LAYOUTS).map(([key, preset]) => (
                        <SelectItem
                            key={key}
                            value={key}
                            className="font-mono text-2xs uppercase tracking-widest"
                        >
                            {preset.name}
                        </SelectItem>
                    ))}
                    {selectedPreset === 'custom' && (
                        <SelectItem
                            value="custom"
                            className="font-mono text-2xs uppercase tracking-widest text-foreground-soft"
                            disabled
                        >
                            Custom
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>

            <button
                onClick={() => {
                    setEditMode((prev) => {
                        if (prev) persistLayout(layout);
                        return !prev;
                    });
                }}
                className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 font-mono text-2xs uppercase tracking-widest transition-colors',
                    editMode
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border border-border bg-card text-foreground-soft hover:border-foreground/30 hover:text-foreground',
                )}
            >
                {editMode ? (
                    <>
                        <Check className="h-3.5 w-3.5" /> Done
                    </>
                ) : (
                    <>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                    </>
                )}
            </button>

            <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft transition-colors hover:border-foreground/30 hover:text-foreground"
            >
                <Save className="h-3.5 w-3.5" /> Save
            </button>
        </div>
    );

    if (!mounted) {
        return (
            <div className="space-y-24 pb-24">
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease }}
                    className="max-w-3xl"
                >
                    <div className="mb-4 flex items-center gap-3">
                        <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            Dashboard
                        </span>
                        <span className="inline-block h-px w-10 bg-foreground-soft" />
                        <span className="font-mono text-2xs uppercase tracking-widest text-primary">
                            Widgets
                        </span>
                    </div>
                    <h1 className="font-display text-[clamp(2.5rem,5vw,3.75rem)] font-medium leading-[0.96] tracking-tightest text-foreground">
                        Widgets <span className="italic text-primary">&amp; cards</span>.
                    </h1>
                </motion.section>
                <div className="flex items-center justify-center py-24">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-24 pb-24">
            {/* Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease }}
                className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
            >
                <div className="max-w-3xl">
                    <div className="mb-4 flex items-center gap-3">
                        <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            Dashboard
                        </span>
                        <span className="inline-block h-px w-10 bg-foreground-soft" />
                        <span className="font-mono text-2xs uppercase tracking-widest text-primary">
                            Widgets
                        </span>
                    </div>
                    <h1 className="font-display text-[clamp(2.5rem,5vw,3.75rem)] font-medium leading-[0.96] tracking-tightest text-foreground">
                        Widgets <span className="italic text-primary">&amp; cards</span>.
                    </h1>
                    <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-foreground-soft">
                        Compose your dashboard from a library of cards — drag to rearrange,
                        resize to suit, save as a preset.
                    </p>
                </div>

                <div className="md:shrink-0">{headerActions}</div>
            </motion.section>

            {/* Edit-mode toolbar */}
            {editMode && (
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease }}
                    className="-mt-12 flex items-center gap-6 border-y border-foreground/15 py-4"
                >
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="inline-flex items-center gap-2 bg-primary px-4 py-2 font-mono text-2xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <Plus className="h-3.5 w-3.5" /> Add widget
                    </button>
                    <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        {layout.length} widget{layout.length !== 1 ? 's' : ''} on dashboard
                    </span>
                </motion.section>
            )}

            {/* Grid or Empty State */}
            <motion.section
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, ease }}
            >
                {layout.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-5 border border-dashed border-primary bg-card py-24 text-center">
                        <PackageOpen className="h-10 w-10 text-foreground-soft/40" />
                        <p className="max-w-md font-serif text-base leading-relaxed text-foreground-soft">
                            No widgets yet. Click{' '}
                            <strong className="font-display text-foreground">Edit</strong> to add
                            widgets or pick a preset.
                        </p>
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                            <button
                                onClick={() => {
                                    setEditMode(true);
                                    setDrawerOpen(true);
                                }}
                                className="inline-flex items-center gap-2 bg-primary px-4 py-2 font-mono text-2xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add widget
                            </button>
                            <button
                                onClick={() => handlePresetChange('default')}
                                className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft transition-colors hover:border-foreground/30 hover:text-foreground"
                            >
                                Load default preset
                            </button>
                        </div>
                    </div>
                ) : (
                    <WidgetGrid
                        layout={layout}
                        editMode={editMode}
                        onLayoutChange={handleLayoutChange}
                        onRemoveWidget={handleRemoveWidget}
                    />
                )}
            </motion.section>

            {/* Widget Drawer */}
            <WidgetDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onAddWidget={handleAddWidget}
                activeWidgetIds={activeWidgetIds}
            />
        </div>
    );
}
