import { describe, it, expect } from 'vitest';
import { validateBudget } from '../budget-guard';

const base = { type: 'daily' as const, amount: 50, currency: 'USD' };

describe('validateBudget', () => {
  it('passes when amount is within both caps', () => {
    const r = validateBudget(base, { brandDailyCap: 100, accountDailyCap: 200 });
    expect(r.ok).toBe(true);
    expect(r.violations).toEqual([]);
  });

  it('fails when over the brand cap', () => {
    const r = validateBudget({ ...base, amount: 150 }, { brandDailyCap: 100, accountDailyCap: 200 });
    expect(r.ok).toBe(false);
    expect(r.violations).toContain('brand');
  });

  it('fails when over the account cap', () => {
    const r = validateBudget({ ...base, amount: 250 }, { brandDailyCap: 1000, accountDailyCap: 200 });
    expect(r.ok).toBe(false);
    expect(r.violations).toContain('account');
  });

  it('reports both when over both caps', () => {
    const r = validateBudget({ ...base, amount: 500 }, { brandDailyCap: 100, accountDailyCap: 200 });
    expect(r.ok).toBe(false);
    expect(r.violations.sort()).toEqual(['account', 'brand']);
  });

  it('treats a null cap as unset (no violation from that level)', () => {
    const r = validateBudget({ ...base, amount: 9999 }, { brandDailyCap: null, accountDailyCap: null });
    expect(r.ok).toBe(true);
  });
});
