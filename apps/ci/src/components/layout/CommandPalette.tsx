'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_FEATURES } from '@/lib/features';
import {
    LayoutDashboard,
    Target,
    Globe,
    TrendingUp,
    Settings,
    Wrench,
    Search,
    Zap,
    Command,
} from 'lucide-react';

// ── Section → Icon mapping ──────────────────────────────────────────

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    Overview: LayoutDashboard,
    Operations: Target,
    'Public Site': Globe,
    'Growth & Revenue': TrendingUp,
    Platform: Settings,
    Tools: Wrench,
};

// ── Quick Actions ───────────────────────────────────────────────────

const QUICK_ACTIONS = [
    { label: 'New Campaign', href: '/admin/brand-campaign-settings', section: 'Quick Actions' },
    { label: 'Create Template', href: '/admin/campaign-templates', section: 'Quick Actions' },
    { label: 'Approval Board', href: '/admin/approval-workflow', section: 'Quick Actions' },
    { label: 'Run Rules', href: '/admin/campaign-rules', section: 'Quick Actions' },
];

// ── Unified search item type ────────────────────────────────────────

interface SearchItem {
    label: string;
    href: string;
    section: string;
}

const ALL_ITEMS: SearchItem[] = [
    ...ALL_FEATURES.map(({ label, href, section }) => ({ label, href, section })),
    ...QUICK_ACTIONS,
];

// ── Highlight matched text ──────────────────────────────────────────

function HighlightedLabel({ label, query }: { label: string; query: string }) {
    if (!query) return <span className="font-medium text-foreground">{label}</span>;

    const idx = label.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span className="font-medium text-foreground">{label}</span>;

    const before = label.slice(0, idx);
    const match = label.slice(idx, idx + query.length);
    const after = label.slice(idx + query.length);

    return (
        <span className="font-medium text-foreground">
            {before}
            <span className="text-primary">{match}</span>
            {after}
        </span>
    );
}

// ── CommandPalette ──────────────────────────────────────────────────

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Filter results
    const results = useMemo(() => {
        if (!query.trim()) return ALL_ITEMS;
        const q = query.toLowerCase();
        return ALL_ITEMS.filter((item) => item.label.toLowerCase().includes(q));
    }, [query]);

    // Group results by section
    const grouped = useMemo(() => {
        const map = new Map<string, SearchItem[]>();
        for (const item of results) {
            const list = map.get(item.section) ?? [];
            list.push(item);
            map.set(item.section, list);
        }
        return Array.from(map.entries());
    }, [results]);

    // Flat list for keyboard nav index
    const flatResults = useMemo(() => grouped.flatMap(([, items]) => items), [grouped]);

    // Reset state when opening / closing
    useEffect(() => {
        if (open) {
            setQuery('');
            setSelectedIndex(0);
            // Small delay so the DOM is mounted before focusing
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    // Clamp selected index when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Global keyboard shortcut
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Navigate to result
    const navigate = useCallback(
        (item: SearchItem) => {
            setOpen(false);
            router.push(item.href);
        },
        [router],
    );

    // Dialog keyboard nav
    const handleDialogKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setOpen(false);
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((i) => (i + 1) % Math.max(flatResults.length, 1));
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((i) => (i - 1 + flatResults.length) % Math.max(flatResults.length, 1));
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                const item = flatResults[selectedIndex];
                if (item) navigate(item);
            }
        },
        [flatResults, selectedIndex, navigate],
    );

    // Scroll selected item into view
    useEffect(() => {
        const container = listRef.current;
        if (!container) return;
        const el = container.querySelector('[data-selected="true"]');
        if (el) {
            el.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    // Get icon for a section
    function SectionIcon({ section }: { section: string }) {
        const Icon = SECTION_ICONS[section] ?? Zap;
        return <Icon className="h-4 w-4 shrink-0 text-foreground-soft" />;
    }

    if (!open) return null;

    let flatIndex = -1;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] animate-in fade-in duration-150"
            onClick={() => setOpen(false)}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background-2/80" />

            {/* Dialog */}
            <div
                className="relative max-w-lg w-full mx-4 bg-card border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleDialogKeyDown}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <Search className="h-5 w-5 text-foreground-soft shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search pages, actions..."
                        className="flex-1 text-lg text-foreground bg-transparent outline-none placeholder:text-foreground-soft"
                    />
                    <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-mono text-foreground-soft">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div ref={listRef} className="max-h-[400px] overflow-y-auto overscroll-contain py-2 scrollbar-hide">
                    {flatResults.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-foreground-soft">
                            No results for &apos;{query}&apos;
                        </div>
                    ) : (
                        grouped.map(([section, items]) => (
                            <div key={section} className="mb-1">
                                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground-soft/60">
                                    {section}
                                </div>
                                {items.map((item) => {
                                    flatIndex++;
                                    const idx = flatIndex;
                                    const isSelected = idx === selectedIndex;
                                    return (
                                        <button
                                            key={`${item.section}-${item.href}`}
                                            data-selected={isSelected}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75 ${
                                                isSelected
                                                    ? 'bg-card border border-border text-foreground'
                                                    : 'text-foreground-soft hover:bg-card/80'
                                            }`}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                            onClick={() => navigate(item)}
                                        >
                                            <SectionIcon section={item.section} />
                                            <HighlightedLabel label={item.label} query={query} />
                                            <span className="ml-auto text-[11px] text-foreground-soft/60">{item.section}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer hints */}
                <div className="flex items-center justify-center gap-4 border-t border-border px-4 py-2.5 text-[11px] text-foreground-soft/60">
                    <span className="flex items-center gap-1">
                        <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono text-[10px]">&uarr;&darr;</kbd>
                        Navigate
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono text-[10px]">&crarr;</kbd>
                        Open
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono text-[10px]">esc</kbd>
                        Close
                    </span>
                </div>
            </div>
        </div>
    );
}

// ── Trigger button for the header ───────────────────────────────────
// This is exported separately so it can be placed in the Header component.
// It dispatches Cmd+K programmatically to open the palette.

export function CommandPaletteTrigger() {
    return (
        <button
            onClick={() => {
                window.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
                );
            }}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground-soft transition-colors hover:bg-card/80 hover:text-foreground"
        >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-mono">
                <Command className="h-2.5 w-2.5" />K
            </kbd>
        </button>
    );
}
