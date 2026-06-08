import { describe, it, expect } from 'vitest';
import { calculatePacing } from '../budget-pacing';

describe('calculatePacing', () => {
    const base = {
        budgetPlanned: 30000,
        totalSpent: 10000,
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-30'),
    };

    it('returns on_track for 80-120% pace', () => {
        const result = calculatePacing({
            ...base,
            now: new Date('2026-04-10'), // 10 days in, 30 day campaign
        });
        // Spent 10k in 10 days = 1k/day, ideal = 1k/day → 100%
        expect(result.paceStatus).toBe('on_track');
        expect(result.daysElapsed).toBe(9);
        expect(result.dailyRunRate).toBeGreaterThan(0);
    });

    it('detects overpacing when spending too fast', () => {
        const result = calculatePacing({
            ...base,
            totalSpent: 20000, // spent 2/3 of budget in 1/3 of time
            now: new Date('2026-04-10'),
        });
        expect(result.paceStatus).toBe('overpacing');
        expect(result.pacePercentage).toBeGreaterThan(120);
    });

    it('detects underpacing when spending too slow', () => {
        const result = calculatePacing({
            ...base,
            totalSpent: 2000, // only 2k spent in 10 days
            now: new Date('2026-04-10'),
        });
        expect(result.paceStatus).toBe('underpacing');
        expect(result.pacePercentage).toBeLessThan(80);
    });

    it('returns no_data when budget is 0', () => {
        const result = calculatePacing({
            ...base,
            budgetPlanned: 0,
        });
        expect(result.paceStatus).toBe('no_data');
    });

    it('returns no_data when dates are null', () => {
        const result = calculatePacing({
            budgetPlanned: 30000,
            totalSpent: 10000,
            startDate: null,
            endDate: null,
        });
        expect(result.paceStatus).toBe('no_data');
    });

    it('returns no_data when nothing spent', () => {
        const result = calculatePacing({
            ...base,
            totalSpent: 0,
            now: new Date('2026-04-10'),
        });
        expect(result.paceStatus).toBe('no_data');
    });

    it('calculates budget utilization correctly', () => {
        const result = calculatePacing({
            ...base,
            now: new Date('2026-04-15'),
        });
        expect(result.budgetUtilization).toBeCloseTo(33.3, 0);
        expect(result.remainingBudget).toBe(20000);
    });

    it('projects total spend based on run rate', () => {
        const result = calculatePacing({
            ...base,
            now: new Date('2026-04-15'),
        });
        expect(result.projectedTotalSpend).toBeGreaterThan(0);
        expect(result.projectedOverUnder).toBeDefined();
    });
});
