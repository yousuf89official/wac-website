/**
 * Budget Pacing — Pure-function library for campaign spend projections.
 */

export interface PacingResult {
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    daysTotal: number;
    daysElapsed: number;
    daysRemaining: number;
    dailyRunRate: number;
    idealDailySpend: number;
    projectedTotalSpend: number;
    paceStatus: 'on_track' | 'overpacing' | 'underpacing' | 'no_data';
    pacePercentage: number;
    budgetUtilization: number;
    projectedOverUnder: number;
}

const MS_PER_DAY = 86_400_000;

function diffDays(a: Date, b: Date): number {
    return Math.floor((b.getTime() - a.getTime()) / MS_PER_DAY);
}

export function calculatePacing(params: {
    budgetPlanned: number;
    totalSpent: number;
    startDate: Date | null;
    endDate: Date | null;
    now?: Date;
}): PacingResult {
    const { budgetPlanned, totalSpent, now = new Date() } = params;
    const startDate = params.startDate ? new Date(params.startDate) : null;
    const endDate = params.endDate ? new Date(params.endDate) : null;

    if (!startDate || !endDate || budgetPlanned <= 0) {
        return {
            totalBudget: budgetPlanned, totalSpent, remainingBudget: budgetPlanned - totalSpent,
            daysTotal: 0, daysElapsed: 0, daysRemaining: 0,
            dailyRunRate: 0, idealDailySpend: 0, projectedTotalSpend: 0,
            paceStatus: 'no_data', pacePercentage: 0, budgetUtilization: 0, projectedOverUnder: 0,
        };
    }

    const daysTotal = Math.max(1, diffDays(startDate, endDate));
    const daysElapsed = Math.max(1, Math.min(diffDays(startDate, now), daysTotal));
    const daysRemaining = Math.max(0, daysTotal - daysElapsed);

    const dailyRunRate = totalSpent / daysElapsed;
    const idealDailySpend = budgetPlanned / daysTotal;
    const projectedTotalSpend = dailyRunRate * daysTotal;
    const pacePercentage = idealDailySpend > 0 ? (dailyRunRate / idealDailySpend) * 100 : 0;

    let paceStatus: PacingResult['paceStatus'] = 'on_track';
    if (totalSpent === 0) paceStatus = 'no_data';
    else if (pacePercentage > 120) paceStatus = 'overpacing';
    else if (pacePercentage < 80) paceStatus = 'underpacing';

    return {
        totalBudget: budgetPlanned,
        totalSpent,
        remainingBudget: budgetPlanned - totalSpent,
        daysTotal,
        daysElapsed,
        daysRemaining,
        dailyRunRate: Math.round(dailyRunRate * 100) / 100,
        idealDailySpend: Math.round(idealDailySpend * 100) / 100,
        projectedTotalSpend: Math.round(projectedTotalSpend * 100) / 100,
        paceStatus,
        pacePercentage: Math.round(pacePercentage * 10) / 10,
        budgetUtilization: budgetPlanned > 0 ? Math.round((totalSpent / budgetPlanned) * 1000) / 10 : 0,
        projectedOverUnder: Math.round((projectedTotalSpend - budgetPlanned) * 100) / 100,
    };
}
