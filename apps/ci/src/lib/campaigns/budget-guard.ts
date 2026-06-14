import type { CampaignSpec } from './spec';

export interface BudgetCaps {
  /** Per-brand daily-equivalent cap in account currency, or null if unset. */
  brandDailyCap: number | null;
  /** Connected ad account daily-equivalent cap in account currency, or null if unset. */
  accountDailyCap: number | null;
}

export interface BudgetCheck {
  ok: boolean;
  violations: Array<'brand' | 'account'>;
}

/**
 * Validate a campaign budget against both the brand cap and the connected
 * account cap. A null cap means "no limit configured at that level".
 * Lifetime budgets are compared directly against the (lifetime-equivalent) caps
 * the caller supplies; the caller is responsible for passing comparable units.
 */
export function validateBudget(
  budget: CampaignSpec['budget'],
  caps: BudgetCaps,
): BudgetCheck {
  const violations: Array<'brand' | 'account'> = [];
  if (caps.brandDailyCap != null && budget.amount > caps.brandDailyCap) {
    violations.push('brand');
  }
  if (caps.accountDailyCap != null && budget.amount > caps.accountDailyCap) {
    violations.push('account');
  }
  return { ok: violations.length === 0, violations };
}
