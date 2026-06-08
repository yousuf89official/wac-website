import { describe, it, expect } from 'vitest';
import {
    parseCondition,
    parseAction,
    computeMetric,
    evaluateCondition,
    getWindowDays,
    isRuleDueForEvaluation,
    aggregateMetrics,
} from '../rules-engine';

describe('parseCondition', () => {
    it('parses valid condition JSON', () => {
        const c = parseCondition('{"metric":"cpa","operator":"gt","value":50,"window":"7d"}');
        expect(c.metric).toBe('cpa');
        expect(c.operator).toBe('gt');
        expect(c.value).toBe(50);
        expect(c.window).toBe('7d');
    });

    it('throws on invalid metric', () => {
        expect(() => parseCondition('{"metric":"invalid","operator":"gt","value":50,"window":"7d"}')).toThrow('Invalid metric');
    });

    it('throws on invalid operator', () => {
        expect(() => parseCondition('{"metric":"cpa","operator":"xx","value":50,"window":"7d"}')).toThrow('Invalid operator');
    });
});

describe('parseAction', () => {
    it('parses valid action JSON', () => {
        const a = parseAction('{"type":"pause_campaign","params":{}}');
        expect(a.type).toBe('pause_campaign');
    });

    it('throws on invalid action type', () => {
        expect(() => parseAction('{"type":"nuke","params":{}}')).toThrow('Invalid action type');
    });
});

describe('computeMetric', () => {
    const data = { spend: 1000, impressions: 50000, clicks: 500, reach: 40000, engagement: 200 };

    it('computes spend', () => {
        expect(computeMetric({ metric: 'spend', operator: 'gt', value: 0, window: '7d' }, data)).toBe(1000);
    });

    it('computes CPA (spend / clicks)', () => {
        expect(computeMetric({ metric: 'cpa', operator: 'gt', value: 0, window: '7d' }, data)).toBe(2);
    });

    it('computes CTR (clicks / impressions * 100)', () => {
        expect(computeMetric({ metric: 'ctr', operator: 'gt', value: 0, window: '7d' }, data)).toBe(1);
    });

    it('computes ROAS (clicks / spend)', () => {
        expect(computeMetric({ metric: 'roas', operator: 'gt', value: 0, window: '7d' }, data)).toBe(0.5);
    });

    it('handles zero clicks for CPA', () => {
        const noClicks = { ...data, clicks: 0 };
        expect(computeMetric({ metric: 'cpa', operator: 'gt', value: 0, window: '7d' }, noClicks)).toBe(1000);
    });
});

describe('evaluateCondition', () => {
    it('gt: 10 > 5 = true', () => expect(evaluateCondition(10, 'gt', 5)).toBe(true));
    it('gt: 5 > 10 = false', () => expect(evaluateCondition(5, 'gt', 10)).toBe(false));
    it('lt: 5 < 10 = true', () => expect(evaluateCondition(5, 'lt', 10)).toBe(true));
    it('gte: 10 >= 10 = true', () => expect(evaluateCondition(10, 'gte', 10)).toBe(true));
    it('lte: 10 <= 10 = true', () => expect(evaluateCondition(10, 'lte', 10)).toBe(true));
    it('eq: 10 == 10 = true', () => expect(evaluateCondition(10, 'eq', 10)).toBe(true));
    it('eq: 10.0001 != 10 = true (within epsilon)', () => expect(evaluateCondition(10.0001, 'eq', 10)).toBe(true));
});

describe('getWindowDays', () => {
    it('maps window strings to days', () => {
        expect(getWindowDays('1d')).toBe(1);
        expect(getWindowDays('7d')).toBe(7);
        expect(getWindowDays('30d')).toBe(30);
    });

    it('defaults to 7 for unknown', () => {
        expect(getWindowDays('unknown')).toBe(7);
    });
});

describe('isRuleDueForEvaluation', () => {
    it('returns true when never evaluated', () => {
        expect(isRuleDueForEvaluation({ frequency: 'daily', lastEvaluatedAt: null })).toBe(true);
    });

    it('returns false for daily rule evaluated 1 hour ago', () => {
        const oneHourAgo = new Date(Date.now() - 3600000);
        expect(isRuleDueForEvaluation({ frequency: 'daily', lastEvaluatedAt: oneHourAgo })).toBe(false);
    });

    it('returns true for hourly rule evaluated 2 hours ago', () => {
        const twoHoursAgo = new Date(Date.now() - 7200000);
        expect(isRuleDueForEvaluation({ frequency: 'hourly', lastEvaluatedAt: twoHoursAgo })).toBe(true);
    });
});

describe('aggregateMetrics', () => {
    it('sums all metric fields', () => {
        const metrics = [
            { spend: 100, impressions: 5000, clicks: 50, reach: 4000, engagement: 20 },
            { spend: 200, impressions: 8000, clicks: 80, reach: 6000, engagement: 30 },
        ];
        const result = aggregateMetrics(metrics);
        expect(result.spend).toBe(300);
        expect(result.impressions).toBe(13000);
        expect(result.clicks).toBe(130);
    });

    it('handles empty array', () => {
        const result = aggregateMetrics([]);
        expect(result.spend).toBe(0);
        expect(result.clicks).toBe(0);
    });

    it('handles undefined fields', () => {
        const result = aggregateMetrics([{ spend: 100 }, { clicks: 50 }]);
        expect(result.spend).toBe(100);
        expect(result.clicks).toBe(50);
        expect(result.impressions).toBe(0);
    });
});
