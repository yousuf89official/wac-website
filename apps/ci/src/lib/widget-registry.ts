// ─── Widget Registry ────────────────────────────────────────────────────────
// Central registry of all available dashboard widgets, preset layouts, and helpers.

export interface WidgetDefinition {
    id: string;
    name: string;
    description: string;
    category: 'metrics' | 'charts' | 'campaigns' | 'intelligence' | 'platform';
    defaultSize: { w: number; h: number };
    minSize?: { w: number; h: number };
    icon: string; // lucide icon name
    configurable?: boolean;
}

export const WIDGET_REGISTRY: WidgetDefinition[] = [
    // Metrics
    { id: 'stats_campaigns', name: 'Active Campaigns', description: 'Count of active campaigns', category: 'metrics', defaultSize: { w: 1, h: 1 }, icon: 'Target' },
    { id: 'stats_spend', name: 'Total Spend', description: 'Aggregated campaign spend', category: 'metrics', defaultSize: { w: 1, h: 1 }, icon: 'DollarSign' },
    { id: 'stats_impressions', name: 'Impressions', description: 'Total impression count', category: 'metrics', defaultSize: { w: 1, h: 1 }, icon: 'Eye' },
    { id: 'stats_roas', name: 'Avg ROAS', description: 'Return on ad spend', category: 'metrics', defaultSize: { w: 1, h: 1 }, icon: 'TrendingUp' },
    // Charts
    { id: 'performance_chart', name: 'Performance Trend', description: 'Engagement trend line chart', category: 'charts', defaultSize: { w: 2, h: 2 }, icon: 'LineChart' },
    // Campaigns
    { id: 'recent_campaigns', name: 'Recent Campaigns', description: 'Latest 5 campaigns', category: 'campaigns', defaultSize: { w: 2, h: 2 }, icon: 'List' },
    { id: 'quick_actions', name: 'Quick Actions', description: 'Navigation shortcuts', category: 'campaigns', defaultSize: { w: 2, h: 1 }, icon: 'Zap' },
    { id: 'activity_feed', name: 'Activity Feed', description: 'Real-time activity timeline', category: 'campaigns', defaultSize: { w: 2, h: 2 }, icon: 'Activity' },
    { id: 'approval_pipeline', name: 'Approval Pipeline', description: 'Campaign approval status counts', category: 'campaigns', defaultSize: { w: 2, h: 1 }, icon: 'GitPullRequestArrow' },
    // Intelligence
    { id: 'budget_pacing', name: 'Budget Pacing', description: 'Campaign spend pacing gauge', category: 'intelligence', defaultSize: { w: 2, h: 2 }, icon: 'Gauge', configurable: true },
    { id: 'ai_insights', name: 'AI Insights', description: 'AI-generated performance analysis', category: 'intelligence', defaultSize: { w: 2, h: 2 }, icon: 'Sparkles', configurable: true },
    { id: 'alerts_summary', name: 'Alerts Summary', description: 'Active spend alerts', category: 'intelligence', defaultSize: { w: 2, h: 1 }, icon: 'Bell' },
    { id: 'rule_status', name: 'Rule Status', description: 'Automation rules overview', category: 'intelligence', defaultSize: { w: 2, h: 1 }, icon: 'Zap' },
    // Platform
    { id: 'platform_health', name: 'Platform Health', description: 'Integration connection status', category: 'platform', defaultSize: { w: 2, h: 1 }, icon: 'Link2' },
    { id: 'brand_overview', name: 'Brand Overview', description: 'Brand metrics summary', category: 'platform', defaultSize: { w: 2, h: 1 }, icon: 'Building2' },
    { id: 'spend_tracker', name: 'Spend Tracker', description: 'Daily spend mini trend', category: 'platform', defaultSize: { w: 2, h: 1 }, icon: 'BarChart3' },
];

export function getWidgetById(id: string): WidgetDefinition | undefined {
    return WIDGET_REGISTRY.find((w) => w.id === id);
}

export function getWidgetsByCategory(category: string): WidgetDefinition[] {
    return WIDGET_REGISTRY.filter((w) => w.category === category);
}

export const WIDGET_CATEGORIES = ['metrics', 'charts', 'campaigns', 'intelligence', 'platform'] as const;

// ─── Layout Types ───────────────────────────────────────────────────────────

export interface WidgetLayoutItem {
    widgetId: string;
    x: number;
    y: number;
    w: number;
    h: number;
    config?: Record<string, unknown>;
}

// ─── Preset Layouts ─────────────────────────────────────────────────────────

export const PRESET_LAYOUTS: Record<string, { name: string; description: string; widgets: WidgetLayoutItem[] }> = {
    default: {
        name: 'Default',
        description: 'Overview of all key metrics',
        widgets: [
            { widgetId: 'stats_campaigns', x: 0, y: 0, w: 1, h: 1 },
            { widgetId: 'stats_spend', x: 1, y: 0, w: 1, h: 1 },
            { widgetId: 'stats_impressions', x: 2, y: 0, w: 1, h: 1 },
            { widgetId: 'stats_roas', x: 3, y: 0, w: 1, h: 1 },
            { widgetId: 'performance_chart', x: 0, y: 1, w: 2, h: 2 },
            { widgetId: 'recent_campaigns', x: 2, y: 1, w: 2, h: 2 },
            { widgetId: 'activity_feed', x: 0, y: 3, w: 2, h: 2 },
            { widgetId: 'quick_actions', x: 2, y: 3, w: 2, h: 1 },
        ],
    },
    analytics: {
        name: 'Analytics Focus',
        description: 'Deep analytics view',
        widgets: [
            { widgetId: 'stats_campaigns', x: 0, y: 0, w: 1, h: 1 },
            { widgetId: 'stats_spend', x: 1, y: 0, w: 1, h: 1 },
            { widgetId: 'stats_impressions', x: 2, y: 0, w: 1, h: 1 },
            { widgetId: 'stats_roas', x: 3, y: 0, w: 1, h: 1 },
            { widgetId: 'performance_chart', x: 0, y: 1, w: 2, h: 2 },
            { widgetId: 'ai_insights', x: 2, y: 1, w: 2, h: 2 },
            { widgetId: 'spend_tracker', x: 0, y: 3, w: 2, h: 1 },
            { widgetId: 'platform_health', x: 2, y: 3, w: 2, h: 1 },
        ],
    },
    campaign_ops: {
        name: 'Campaign Ops',
        description: 'Campaign management focus',
        widgets: [
            { widgetId: 'approval_pipeline', x: 0, y: 0, w: 2, h: 1 },
            { widgetId: 'rule_status', x: 2, y: 0, w: 2, h: 1 },
            { widgetId: 'recent_campaigns', x: 0, y: 1, w: 2, h: 2 },
            { widgetId: 'activity_feed', x: 2, y: 1, w: 2, h: 2 },
            { widgetId: 'alerts_summary', x: 0, y: 3, w: 2, h: 1 },
            { widgetId: 'quick_actions', x: 2, y: 3, w: 2, h: 1 },
        ],
    },
    minimal: {
        name: 'Minimal',
        description: 'Clean overview',
        widgets: [
            { widgetId: 'stats_campaigns', x: 0, y: 0, w: 1, h: 1 },
            { widgetId: 'stats_spend', x: 1, y: 0, w: 1, h: 1 },
            { widgetId: 'stats_impressions', x: 2, y: 0, w: 1, h: 1 },
            { widgetId: 'stats_roas', x: 3, y: 0, w: 1, h: 1 },
            { widgetId: 'quick_actions', x: 0, y: 1, w: 4, h: 1 },
        ],
    },
};

// ─── Constants ─────────────────────────────────────────────────────────────

export const LAYOUT_STORAGE_KEY = 'ci-dashboard-layout';
