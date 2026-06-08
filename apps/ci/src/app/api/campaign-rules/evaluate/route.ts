import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-log';
import { sendEmail } from '@/lib/email';
import {
    parseCondition, parseAction, computeMetric, evaluateCondition,
    getWindowDays, isRuleDueForEvaluation, aggregateMetrics,
} from '@/lib/rules-engine';

export async function POST(request: Request) {
    // Auth: cron secret or admin session
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
        // Cron auth OK
    } else {
        const { requireAdmin } = await import('@/lib/api-auth');
        const { error } = await requireAdmin();
        if (error) return error;
    }

    const now = new Date();
    const errors: string[] = [];
    let evaluated = 0;
    let triggered = 0;

    try {
        const rules = await prisma.campaignRule.findMany({
            where: { isActive: true },
            include: { campaign: { select: { id: true, name: true, budgetPlanned: true, status: true } } },
        });

        for (const rule of rules) {
            if (!isRuleDueForEvaluation(rule, now)) continue;

            evaluated++;

            try {
                const condition = parseCondition(rule.condition);
                const action = parseAction(rule.action);
                const windowDays = getWindowDays(condition.window);
                const windowStart = new Date(now.getTime() - windowDays * 86_400_000);

                // Fetch metrics in window
                const metrics = await prisma.metric.findMany({
                    where: { campaignId: rule.campaignId, date: { gte: windowStart } },
                });

                const aggregated = aggregateMetrics(metrics);
                const metricValue = computeMetric(condition, aggregated);
                const matched = evaluateCondition(metricValue, condition.operator, condition.value);

                if (matched) {
                    const newHits = rule.currentHits + 1;

                    if (newHits >= rule.consecutiveHits) {
                        // Execute action
                        let actionResult = '';
                        try {
                            switch (action.type) {
                                case 'pause_campaign':
                                    await prisma.campaign.update({ where: { id: rule.campaignId }, data: { status: 'Paused' } });
                                    actionResult = 'Campaign paused';
                                    break;
                                case 'activate_campaign':
                                    await prisma.campaign.update({ where: { id: rule.campaignId }, data: { status: 'Active' } });
                                    actionResult = 'Campaign activated';
                                    break;
                                case 'send_alert':
                                    const emails = action.params?.emails || [];
                                    if (emails.length > 0) {
                                        await sendEmail({
                                            to: emails,
                                            subject: `Rule Alert: "${rule.name}" triggered on "${rule.campaign.name}"`,
                                            html: `<p>Rule <strong>${rule.name}</strong> triggered for campaign <strong>${rule.campaign.name}</strong>.</p>
                                                   <p>${condition.metric} = ${metricValue.toFixed(2)} (threshold: ${condition.operator} ${condition.value})</p>`,
                                        });
                                    }
                                    actionResult = `Alert sent to ${emails.length} recipients`;
                                    break;
                                case 'adjust_budget': {
                                    const change = action.params?.change || 0;
                                    const unit = action.params?.unit || 'percent';
                                    const current = rule.campaign.budgetPlanned || 0;
                                    const newBudget = unit === 'percent'
                                        ? current * (1 + change / 100)
                                        : current + change;
                                    await prisma.campaign.update({ where: { id: rule.campaignId }, data: { budgetPlanned: Math.max(0, newBudget) } });
                                    actionResult = `Budget adjusted from ${current} to ${newBudget.toFixed(2)}`;
                                    break;
                                }
                            }
                        } catch (actionErr: any) {
                            actionResult = `Action failed: ${actionErr.message}`;
                        }

                        // Log execution
                        await prisma.ruleExecution.create({
                            data: { ruleId: rule.id, matched: true, metricVal: metricValue, actionTaken: JSON.stringify({ ...action, result: actionResult }) },
                        });

                        await prisma.campaignRule.update({
                            where: { id: rule.id },
                            data: { lastTriggeredAt: now, lastEvaluatedAt: now, currentHits: 0 },
                        });

                        triggered++;

                        await logActivity({
                            userName: 'System', userEmail: 'rules@system',
                            action: 'rule_triggered', target: 'CampaignRule',
                            detail: `Rule "${rule.name}" triggered for "${rule.campaign.name}": ${condition.metric}=${metricValue.toFixed(2)} → ${action.type}`,
                            severity: 'warning',
                        });
                    } else {
                        // Increment hits, not yet at threshold
                        await prisma.campaignRule.update({
                            where: { id: rule.id },
                            data: { currentHits: newHits, lastEvaluatedAt: now },
                        });
                        await prisma.ruleExecution.create({
                            data: { ruleId: rule.id, matched: true, metricVal: metricValue },
                        });
                    }
                } else {
                    // No match — reset consecutive hits
                    await prisma.campaignRule.update({
                        where: { id: rule.id },
                        data: { currentHits: 0, lastEvaluatedAt: now },
                    });
                    await prisma.ruleExecution.create({
                        data: { ruleId: rule.id, matched: false, metricVal: metricValue },
                    });
                }
            } catch (ruleErr: any) {
                errors.push(`Rule ${rule.id}: ${ruleErr.message}`);
            }
        }

        return NextResponse.json({ evaluated, triggered, total: rules.length, errors });
    } catch (err: any) {
        console.error('Rule evaluation error:', err);
        return NextResponse.json({ error: 'Rule evaluation failed', details: err.message }, { status: 500 });
    }
}
