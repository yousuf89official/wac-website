import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateBrandSummary, scoreBrand, detectAnomalies, generateBenchmarks } from '@/lib/intelligence';
import { logActivity } from '@/lib/activity-log';
import { sendEmail } from '@/lib/email';

/**
 * POST /api/scheduled-reports/send — Process due scheduled reports.
 *
 * Called by Vercel Cron (or manually by admin).
 * Finds reports where nextSendAt <= now, generates data, sends email, updates nextSendAt.
 */
export async function POST(request: Request) {
    // Verify cron secret or admin auth
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        // Fall back to admin auth
        const { requireAdmin } = await import('@/lib/api-auth');
        const { error } = await requireAdmin();
        if (error) return error;
    }

    try {
        const now = new Date();

        // Find all due reports
        const dueReports = await prisma.scheduledReport.findMany({
            where: {
                isActive: true,
                nextSendAt: { lte: now },
            },
            include: {
                brand: { select: { id: true, name: true, slug: true } },
                user: { select: { id: true, name: true, email: true } },
            },
        });

        if (dueReports.length === 0) {
            return NextResponse.json({ processed: 0, message: 'No reports due' });
        }

        const results: { reportId: string; brandName: string; status: string; error?: string }[] = [];

        for (const report of dueReports) {
            try {
                const recipients: string[] = JSON.parse(report.recipientEmails || '[]');
                if (recipients.length === 0) continue;

                // Generate intelligence data
                const [summary, scores, anomalyData, benchmarkData] = await Promise.all([
                    generateBrandSummary(report.brandId, report.periodDays),
                    report.includeScores ? scoreBrand(report.brandId, report.periodDays) : Promise.resolve([]),
                    report.includeAnomalies ? detectAnomalies(report.brandId, report.periodDays) : Promise.resolve([]),
                    report.includeBenchmarks ? generateBenchmarks(report.brandId, report.periodDays) : Promise.resolve(null),
                ]);

                // Build email HTML
                const emailHtml = buildReportEmail({
                    brandName: report.brand.name,
                    period: `Last ${report.periodDays} days`,
                    headline: summary.headline,
                    executiveSummary: summary.executiveSummary,
                    keyMetrics: summary.keyMetrics,
                    recommendations: summary.recommendations,
                    scores: scores as any[],
                    anomalies: anomalyData as any[],
                    benchmarks: benchmarkData,
                    generatedBy: report.user?.name || 'System',
                });

                // Send email via Resend
                await sendEmail({
                    to: recipients,
                    subject: `${report.brand.name} — ${summary.headline}`,
                    html: emailHtml,
                });

                // Calculate next send time
                const nextSendAt = calculateNextSend(report.frequency, report.dayOfWeek, report.dayOfMonth, report.hour);

                await prisma.scheduledReport.update({
                    where: { id: report.id },
                    data: { lastSentAt: now, nextSendAt },
                });

                await logActivity({
                    userName: 'System',
                    userEmail: 'scheduler@system',
                    action: 'export',
                    target: 'ScheduledReport',
                    detail: `Sent ${report.frequency} report for ${report.brand.name} to ${recipients.length} recipients`,
                });

                results.push({ reportId: report.id, brandName: report.brand.name, status: 'sent' });
            } catch (err: any) {
                results.push({ reportId: report.id, brandName: report.brand?.name || '?', status: 'error', error: err.message });
            }
        }

        return NextResponse.json({
            processed: results.length,
            sent: results.filter(r => r.status === 'sent').length,
            errors: results.filter(r => r.status === 'error').length,
            results,
        });
    } catch (err: any) {
        console.error('Scheduled reports send error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

function calculateNextSend(frequency: string, dayOfWeek: number, dayOfMonth: number, hour: number): Date {
    const next = new Date();
    next.setUTCHours(hour, 0, 0, 0);

    if (frequency === 'daily') {
        next.setDate(next.getDate() + 1);
    } else if (frequency === 'weekly') {
        next.setDate(next.getDate() + 7);
    } else if (frequency === 'monthly') {
        next.setUTCMonth(next.getUTCMonth() + 1);
        next.setUTCDate(Math.min(dayOfMonth, 28));
    }

    return next;
}

function buildReportEmail(data: any): string {
    const { brandName, period, headline, executiveSummary, keyMetrics, recommendations, scores, anomalies, benchmarks } = data;

    const scoreRows = (scores || []).slice(0, 5).map((s: any) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #1a2744;color:#fff;font-weight:600">${s.campaignName}</td>
         <td style="padding:8px 12px;border-bottom:1px solid #1a2744;text-align:center"><span style="background:${s.overallScore >= 60 ? '#22c55e20' : s.overallScore >= 35 ? '#f59e0b20' : '#ef444420'};color:${s.overallScore >= 60 ? '#22c55e' : s.overallScore >= 35 ? '#f59e0b' : '#ef4444'};padding:2px 8px;border-radius:8px;font-weight:700">${s.overallScore}/100</span></td>
         <td style="padding:8px 12px;border-bottom:1px solid #1a2744;color:#9ca3af;font-size:12px">${s.trend}</td></tr>`
    ).join('');

    const anomalyItems = (anomalies || []).slice(0, 5).map((a: any) =>
        `<div style="padding:8px 12px;margin-bottom:4px;background:${a.severity === 'critical' ? '#ef444410' : '#f59e0b08'};border-left:3px solid ${a.severity === 'critical' ? '#ef4444' : '#f59e0b'};border-radius:4px;font-size:13px;color:#d1d5db">${a.message}</div>`
    ).join('');

    const recItems = (recommendations || []).map((r: string) =>
        `<li style="margin-bottom:6px;color:#d1d5db;font-size:13px">${r}</li>`
    ).join('');

    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0C1222;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
    <div style="max-width:640px;margin:0 auto;padding:32px 24px">
        <div style="text-align:center;margin-bottom:32px">
            <div style="display:inline-block;background:linear-gradient(135deg,#0D9488,#0EA5E9);width:40px;height:40px;border-radius:12px;margin-bottom:12px"></div>
            <h1 style="color:#fff;font-size:20px;margin:0">${brandName}</h1>
            <p style="color:#6b7280;font-size:12px;margin:4px 0">${period} Performance Report</p>
        </div>
        <div style="background:#162032;border:1px solid #1a2744;border-radius:16px;padding:24px;margin-bottom:16px">
            <h2 style="color:#0D9488;font-size:14px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">${headline}</h2>
            <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0">${executiveSummary}</p>
        </div>
        ${keyMetrics ? `<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
            <div style="flex:1;min-width:120px;background:#162032;border:1px solid #1a2744;border-radius:12px;padding:16px;text-align:center">
                <div style="color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:1px">Impressions</div>
                <div style="color:#fff;font-size:20px;font-weight:700;margin-top:4px">${(keyMetrics.totalImpressions || 0).toLocaleString()}</div>
            </div>
            <div style="flex:1;min-width:120px;background:#162032;border:1px solid #1a2744;border-radius:12px;padding:16px;text-align:center">
                <div style="color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:1px">Clicks</div>
                <div style="color:#fff;font-size:20px;font-weight:700;margin-top:4px">${(keyMetrics.totalClicks || 0).toLocaleString()}</div>
            </div>
            <div style="flex:1;min-width:120px;background:#162032;border:1px solid #1a2744;border-radius:12px;padding:16px;text-align:center">
                <div style="color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:1px">Spend</div>
                <div style="color:#fff;font-size:20px;font-weight:700;margin-top:4px">$${(keyMetrics.totalSpend || 0).toLocaleString()}</div>
            </div>
            <div style="flex:1;min-width:120px;background:#162032;border:1px solid #1a2744;border-radius:12px;padding:16px;text-align:center">
                <div style="color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:1px">CTR</div>
                <div style="color:#fff;font-size:20px;font-weight:700;margin-top:4px">${(keyMetrics.avgCTR || 0).toFixed(2)}%</div>
            </div>
        </div>` : ''}
        ${scoreRows ? `<div style="background:#162032;border:1px solid #1a2744;border-radius:16px;overflow:hidden;margin-bottom:16px">
            <div style="padding:16px;border-bottom:1px solid #1a2744"><h3 style="color:#fff;font-size:14px;margin:0">Campaign Scores</h3></div>
            <table style="width:100%;border-collapse:collapse">
                <thead><tr style="background:#0d1526"><th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:10px;text-transform:uppercase">Campaign</th><th style="padding:8px 12px;text-align:center;color:#6b7280;font-size:10px;text-transform:uppercase">Score</th><th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:10px;text-transform:uppercase">Trend</th></tr></thead>
                <tbody>${scoreRows}</tbody>
            </table>
        </div>` : ''}
        ${anomalyItems ? `<div style="background:#162032;border:1px solid #1a2744;border-radius:16px;padding:16px;margin-bottom:16px">
            <h3 style="color:#fff;font-size:14px;margin:0 0 12px">Anomalies Detected</h3>
            ${anomalyItems}
        </div>` : ''}
        ${recItems ? `<div style="background:#0D948810;border:1px solid #0D948830;border-radius:16px;padding:16px;margin-bottom:16px">
            <h3 style="color:#0D9488;font-size:14px;margin:0 0 12px">Recommendations</h3>
            <ul style="margin:0;padding-left:20px">${recItems}</ul>
        </div>` : ''}
        <div style="text-align:center;padding:24px 0;border-top:1px solid #1a2744;margin-top:24px">
            <p style="color:#4b5563;font-size:11px;margin:0">Generated by Collaborative Intelligence</p>
            <p style="color:#374151;font-size:10px;margin:4px 0 0">This is an automated report. <a href="${process.env.NEXTAUTH_URL || 'https://collaborativeintelligence.com'}" style="color:#0D9488">View full dashboard</a></p>
        </div>
    </div></body></html>`;
}
