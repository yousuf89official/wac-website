'use client';

import React from 'react';
import {
    GripVertical,
    X,
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
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWidgetById, type WidgetLayoutItem } from '@/lib/widget-registry';

// Lazy-import existing widget components
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { BudgetPacingWidget } from '@/components/campaigns/BudgetPacingWidget';
import AIInsights from '@/components/campaigns/AIInsights';
import AlertsPanel from '@/components/campaigns/AlertsPanel';

// ─── Icon Map ───────────────────────────────────────────────────────────────

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

// ─── Props ──────────────────────────────────────────────────────────────────

interface WidgetGridProps {
    layout: WidgetLayoutItem[];
    editMode: boolean;
    onLayoutChange: (layout: WidgetLayoutItem[]) => void;
    onRemoveWidget: (widgetId: string) => void;
    dashboardData?: {
        activeCampaigns?: number;
        totalSpend?: number;
        impressions?: number;
        avgRoas?: number;
    };
    brandId?: string;
    campaignId?: string;
}

// ─── Placeholder Widget ─────────────────────────────────────────────────────

function PlaceholderWidget({ name, icon }: { name: string; icon: string }) {
    const Icon = ICON_MAP[icon] ?? Activity;
    return (
        <Card className="h-full bg-card border-border">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Icon size={16} className="text-primary" />
                    {name}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
                <p className="text-xs text-muted-foreground/60">Coming soon</p>
            </CardContent>
        </Card>
    );
}

// ─── Widget Renderer ────────────────────────────────────────────────────────

function renderWidget(
    item: WidgetLayoutItem,
    dashboardData?: WidgetGridProps['dashboardData'],
    brandId?: string,
    campaignId?: string,
): React.ReactNode {
    const def = getWidgetById(item.widgetId);

    switch (item.widgetId) {
        // Stat cards
        case 'stats_campaigns':
            return (
                <StatCard
                    label="Active Campaigns"
                    value={dashboardData?.activeCampaigns ?? 0}
                    icon={Target}
                    className="h-full"
                />
            );
        case 'stats_spend':
            return (
                <StatCard
                    label="Total Spend"
                    value={`$${((dashboardData?.totalSpend ?? 0) / 1000).toFixed(1)}k`}
                    icon={DollarSign}
                    className="h-full"
                />
            );
        case 'stats_impressions':
            return (
                <StatCard
                    label="Impressions"
                    value={((dashboardData?.impressions ?? 0) / 1000).toFixed(1) + 'k'}
                    icon={Eye}
                    className="h-full"
                />
            );
        case 'stats_roas':
            return (
                <StatCard
                    label="Avg ROAS"
                    value={`${dashboardData?.avgRoas ?? 0}x`}
                    icon={TrendingUp}
                    className="h-full"
                />
            );

        // Activity feed
        case 'activity_feed':
            return (
                <Card className="h-full bg-card border-border overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Activity size={16} className="text-primary" />
                            Activity Feed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto max-h-[280px]">
                        <ActivityFeed limit={5} compact />
                    </CardContent>
                </Card>
            );

        // Budget pacing (requires campaignId)
        case 'budget_pacing':
            if (!campaignId) {
                return <PlaceholderWidget name="Budget Pacing" icon="Gauge" />;
            }
            return <BudgetPacingWidget campaignId={campaignId} compact />;

        // AI Insights (requires brandId)
        case 'ai_insights':
            if (!brandId) {
                return <PlaceholderWidget name="AI Insights" icon="Sparkles" />;
            }
            return <AIInsights brandId={brandId} compact />;

        // Alerts (requires campaignId)
        case 'alerts_summary':
            if (!campaignId) {
                return <PlaceholderWidget name="Alerts Summary" icon="Bell" />;
            }
            return <AlertsPanel campaignId={campaignId} />;

        // Widgets without dedicated components yet — render placeholders
        default:
            return (
                <PlaceholderWidget
                    name={def?.name ?? item.widgetId}
                    icon={def?.icon ?? 'Activity'}
                />
            );
    }
}

// ─── WidgetGrid Component ───────────────────────────────────────────────────

export function WidgetGrid({
    layout,
    editMode,
    onLayoutChange,
    onRemoveWidget,
    dashboardData,
    brandId,
    campaignId,
}: WidgetGridProps) {
    return (
        <div
            className={cn(
                'grid gap-4',
                'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
            )}
        >
            {layout.map((item) => {
                const def = getWidgetById(item.widgetId);

                return (
                    <div
                        key={item.widgetId}
                        className={cn(
                            'relative min-h-0',
                            // Responsive column spanning
                            item.w === 1 && 'sm:col-span-1 lg:col-span-1',
                            item.w === 2 && 'sm:col-span-2 lg:col-span-2',
                            item.w === 3 && 'sm:col-span-2 lg:col-span-3',
                            item.w >= 4 && 'sm:col-span-2 lg:col-span-4',
                            // Row spanning
                            item.h === 2 && 'row-span-2',
                            item.h >= 3 && 'row-span-3',
                            // Edit mode border
                            editMode && 'ring-2 ring-dashed ring-primary/40 rounded-xl',
                        )}
                    >
                        {/* Edit mode overlay controls */}
                        {editMode && (
                            <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                                <button
                                    className="p-1 rounded bg-card hover:bg-card/80 text-foreground-soft hover:text-foreground cursor-grab active:cursor-grabbing transition-colors"
                                    title="Drag to reorder"
                                    aria-label={`Drag ${def?.name ?? item.widgetId}`}
                                >
                                    <GripVertical size={14} />
                                </button>
                                <button
                                    onClick={() => onRemoveWidget(item.widgetId)}
                                    className="p-1 rounded bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive transition-colors"
                                    title="Remove widget"
                                    aria-label={`Remove ${def?.name ?? item.widgetId}`}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {renderWidget(item, dashboardData, brandId, campaignId)}
                    </div>
                );
            })}
        </div>
    );
}
