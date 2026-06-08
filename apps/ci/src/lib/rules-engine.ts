/**
 * Campaign Rules Engine — Pure-function library for condition evaluation and metric computation.
 * No Prisma imports — all DB access happens in route handlers.
 */

export interface RuleCondition {
    metric: 'spend' | 'cpa' | 'ctr' | 'roas' | 'impressions' | 'clicks';
    operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
    value: number;
    window: '1d' | '3d' | '7d' | '14d' | '30d';
}

export interface RuleAction {
    type: 'pause_campaign' | 'activate_campaign' | 'send_alert' | 'adjust_budget';
    params: Record<string, any>;
}

export interface MetricData {
    spend: number;
    impressions: number;
    clicks: number;
    reach: number;
    engagement: number;
}

const VALID_METRICS = ['spend', 'cpa', 'ctr', 'roas', 'impressions', 'clicks'];
const VALID_OPERATORS = ['gt', 'lt', 'gte', 'lte', 'eq'];
const VALID_WINDOWS = ['1d', '3d', '7d', '14d', '30d'];
const VALID_ACTIONS = ['pause_campaign', 'activate_campaign', 'send_alert', 'adjust_budget'];

export function parseCondition(json: string): RuleCondition {
    const parsed = JSON.parse(json);
    if (!VALID_METRICS.includes(parsed.metric)) throw new Error(`Invalid metric: ${parsed.metric}`);
    if (!VALID_OPERATORS.includes(parsed.operator)) throw new Error(`Invalid operator: ${parsed.operator}`);
    if (typeof parsed.value !== 'number') throw new Error('Value must be a number');
    if (!VALID_WINDOWS.includes(parsed.window)) throw new Error(`Invalid window: ${parsed.window}`);
    return parsed as RuleCondition;
}

export function parseAction(json: string): RuleAction {
    const parsed = JSON.parse(json);
    if (!VALID_ACTIONS.includes(parsed.type)) throw new Error(`Invalid action type: ${parsed.type}`);
    return parsed as RuleAction;
}

export function computeMetric(condition: RuleCondition, data: MetricData): number {
    switch (condition.metric) {
        case 'spend': return data.spend;
        case 'impressions': return data.impressions;
        case 'clicks': return data.clicks;
        case 'cpa': return data.spend / Math.max(data.clicks, 1);
        case 'ctr': return (data.clicks / Math.max(data.impressions, 1)) * 100;
        case 'roas': return data.clicks / Math.max(data.spend, 0.01);
        default: return 0;
    }
}

export function evaluateCondition(metricValue: number, operator: string, threshold: number): boolean {
    switch (operator) {
        case 'gt': return metricValue > threshold;
        case 'lt': return metricValue < threshold;
        case 'gte': return metricValue >= threshold;
        case 'lte': return metricValue <= threshold;
        case 'eq': return Math.abs(metricValue - threshold) < 0.001;
        default: return false;
    }
}

export function getWindowDays(window: string): number {
    const map: Record<string, number> = { '1d': 1, '3d': 3, '7d': 7, '14d': 14, '30d': 30 };
    return map[window] || 7;
}

export function isRuleDueForEvaluation(rule: { frequency: string; lastEvaluatedAt: Date | null }, now?: Date): boolean {
    const currentTime = now || new Date();
    if (!rule.lastEvaluatedAt) return true;
    const elapsed = currentTime.getTime() - new Date(rule.lastEvaluatedAt).getTime();
    const hourMs = 3_600_000;
    if (rule.frequency === 'hourly') return elapsed >= hourMs;
    return elapsed >= 24 * hourMs; // daily
}

export function aggregateMetrics(metrics: Array<{ spend?: number; impressions?: number; clicks?: number; reach?: number; engagement?: number }>): MetricData {
    const initial: MetricData = { spend: 0, impressions: 0, clicks: 0, reach: 0, engagement: 0 };
    return metrics.reduce<MetricData>((acc, m) => ({
        spend: acc.spend + (Number(m.spend) || 0),
        impressions: acc.impressions + (Number(m.impressions) || 0),
        clicks: acc.clicks + (Number(m.clicks) || 0),
        reach: acc.reach + (Number(m.reach) || 0),
        engagement: acc.engagement + (Number(m.engagement) || 0),
    }), initial);
}
