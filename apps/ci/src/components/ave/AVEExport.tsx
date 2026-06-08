'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TableIcon, PrinterIcon, LinkIcon } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AVEExportProps {
    campaignInfo: Record<string, string>;
    results: Record<string, number | undefined> & {
        sovReach?: number;
        sovEngagement?: number;
        are?: number;
        ee?: number;
        taa?: number;
        impressionAve?: number;
        engagementAve?: number;
        videoViewAve?: number;
        weightedAve?: number;
    };
    channels: string[];
    aiAnalysis?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (): string => {
    return new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const fileDate = (): string => {
    return new Date().toISOString().split('T')[0];
};

const sanitizeFilename = (str: string): string => {
    return str.replace(/[^a-zA-Z0-9-_]/g, '_').replace(/_+/g, '_');
};

const formatIDR = (value: number): string => {
    return `IDR ${value.toLocaleString('id-ID', { minimumFractionDigits: 2 })}`;
};

// ─── CSV Export ──────────────────────────────────────────────────────────────

function generateCSV(props: AVEExportProps): string {
    const { campaignInfo, results, channels } = props;
    const rows: [string, string][] = [
        ['Metric', 'Value'],
        ['Brand', campaignInfo.brandName],
        ['Campaign', campaignInfo.campaignName],
        ['Type', campaignInfo.campaignType],
        ['Objective', campaignInfo.objective],
        ['Channels', `"${channels.join(', ')}"`],
    ];

    if (results.sovReach !== undefined) {
        rows.push(['Share of Reach (%)', String(results.sovReach)]);
    }
    if (results.sovEngagement !== undefined) {
        rows.push(['Share of Engagement (%)', String(results.sovEngagement)]);
    }
    if (results.are !== undefined) {
        rows.push(['Audience Reach Efficiency (%)', String(results.are)]);
    }
    if (results.ee !== undefined) {
        rows.push(['Engagement Efficiency (%)', String(results.ee)]);
    }
    if (results.taa !== undefined) {
        rows.push(['Total Audience Activation (%)', String(results.taa)]);
    }
    if (results.impressionAve !== undefined) {
        rows.push(['Impression AVE (IDR)', String(results.impressionAve)]);
    }
    if (results.engagementAve !== undefined) {
        rows.push(['Engagement AVE (IDR)', String(results.engagementAve)]);
    }
    if (results.videoViewAve !== undefined) {
        rows.push(['Video View AVE (IDR)', String(results.videoViewAve)]);
    }
    if (results.weightedAve !== undefined) {
        rows.push(['Weighted AVE Total (IDR)', String(results.weightedAve)]);
    }

    return rows.map((row) => row.join(',')).join('\n');
}

function downloadCSV(props: AVEExportProps): void {
    const csv = generateCSV(props);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `${sanitizeFilename(props.campaignInfo.brandName)}-${sanitizeFilename(props.campaignInfo.campaignName)}-AVE-${fileDate()}.csv`;
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV Downloaded', { description: filename });
}

// ─── PDF / Print Export ──────────────────────────────────────────────────────

function buildPrintHTML(props: AVEExportProps): string {
    const { campaignInfo, results, channels, aiAnalysis } = props;
    const date = formatDate();

    const hasSOV = results.sovReach !== undefined || results.sovEngagement !== undefined;
    const hasEfficiency = results.are !== undefined || results.ee !== undefined || results.taa !== undefined;
    const hasAVE = results.impressionAve !== undefined || results.engagementAve !== undefined || results.videoViewAve !== undefined;

    let sovRows = '';
    if (hasSOV) {
        if (results.sovReach !== undefined) {
            sovRows += `<tr><td>Share of Reach</td><td>${results.sovReach}%</td></tr>`;
        }
        if (results.sovEngagement !== undefined) {
            sovRows += `<tr><td>Share of Engagement</td><td>${results.sovEngagement}%</td></tr>`;
        }
    }

    let efficiencyRows = '';
    if (hasEfficiency) {
        if (results.are !== undefined) {
            efficiencyRows += `<tr><td>Audience Reach Efficiency (ARE)</td><td>${results.are}%</td></tr>`;
        }
        if (results.ee !== undefined) {
            efficiencyRows += `<tr><td>Engagement Efficiency (EE)</td><td>${results.ee}%</td></tr>`;
        }
        if (results.taa !== undefined) {
            efficiencyRows += `<tr><td>Total Audience Activation (TAA)</td><td>${results.taa}%</td></tr>`;
        }
    }

    let aveRows = '';
    if (hasAVE) {
        if (results.impressionAve !== undefined) {
            aveRows += `<tr><td>Impression-Based AVE</td><td>${formatIDR(results.impressionAve)}</td></tr>`;
        }
        if (results.engagementAve !== undefined) {
            aveRows += `<tr><td>Engagement-Based AVE</td><td>${formatIDR(results.engagementAve)}</td></tr>`;
        }
        if (results.videoViewAve !== undefined) {
            aveRows += `<tr><td>Video View-Based AVE</td><td>${formatIDR(results.videoViewAve)}</td></tr>`;
        }
        if (results.weightedAve !== undefined) {
            aveRows += `<tr class="weighted-row"><td><strong>Weighted AVE Total</strong></td><td><strong>${formatIDR(results.weightedAve)}</strong></td></tr>`;
        }
    }

    // Convert markdown-style AI analysis to HTML
    let aiHTML = '';
    if (aiAnalysis) {
        const lines = aiAnalysis.split('\n');
        for (const line of lines) {
            if (line.startsWith('## ')) {
                aiHTML += `<h3>${line.replace('## ', '')}</h3>`;
            } else if (line.startsWith('**')) {
                const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                aiHTML += `<p>${formatted}</p>`;
            } else if (line.startsWith('- ')) {
                aiHTML += `<li>${line.replace('- ', '')}</li>`;
            } else if (line.trim()) {
                aiHTML += `<p>${line}</p>`;
            }
        }
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Media Analysis Report - ${campaignInfo.brandName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1a1a2e;
            background: #ffffff;
            padding: 40px;
            line-height: 1.6;
        }

        .header {
            border-bottom: 3px solid #0D9488;
            padding-bottom: 20px;
            margin-bottom: 32px;
        }
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 4px;
        }
        .header .subtitle {
            font-size: 14px;
            color: #6b7280;
        }

        .section {
            margin-bottom: 28px;
        }
        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #0D9488;
            border-left: 3px solid #0D9488;
            padding-left: 12px;
            margin-bottom: 12px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 24px;
        }
        .info-item {
            font-size: 13px;
        }
        .info-item .label {
            color: #6b7280;
            font-weight: 500;
        }
        .info-item .value {
            color: #1a1a2e;
            font-weight: 600;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        table th {
            text-align: left;
            padding: 10px 12px;
            background: #f0fdfa;
            color: #0D9488;
            font-weight: 600;
            border-bottom: 2px solid #0D9488;
        }
        table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        table tr:last-child td {
            border-bottom: none;
        }
        .weighted-row td {
            background: #f0fdfa;
            font-size: 14px;
        }

        .channels {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
        .channel-tag {
            display: inline-block;
            background: #f0fdfa;
            color: #0D9488;
            border: 1px solid #99f6e4;
            border-radius: 4px;
            padding: 2px 10px;
            font-size: 12px;
            font-weight: 500;
        }

        .ai-analysis {
            background: #fafafa;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            font-size: 13px;
        }
        .ai-analysis h3 {
            font-size: 16px;
            margin-bottom: 12px;
            color: #1a1a2e;
        }
        .ai-analysis p {
            margin-bottom: 8px;
        }
        .ai-analysis strong {
            color: #0D9488;
        }
        .ai-analysis li {
            margin-left: 20px;
            margin-bottom: 4px;
            color: #374151;
        }

        .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
        }

        @media print {
            body { padding: 20px; }
            .section { break-inside: avoid; }
            @page { margin: 1.5cm; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Media Analysis Report</h1>
        <div class="subtitle">${campaignInfo.brandName} &mdash; ${date}</div>
    </div>

    <div class="section">
        <div class="section-title">Campaign Information</div>
        <div class="info-grid">
            <div class="info-item">
                <span class="label">Brand: </span>
                <span class="value">${campaignInfo.brandName}</span>
            </div>
            <div class="info-item">
                <span class="label">Campaign: </span>
                <span class="value">${campaignInfo.campaignName}</span>
            </div>
            <div class="info-item">
                <span class="label">Type: </span>
                <span class="value">${campaignInfo.campaignType}</span>
            </div>
            <div class="info-item">
                <span class="label">Objective: </span>
                <span class="value">${campaignInfo.objective}</span>
            </div>
        </div>
    </div>

    ${channels.length > 0 ? `
    <div class="section">
        <div class="section-title">Channels</div>
        <div class="channels">
            ${channels.map((ch) => `<span class="channel-tag">${ch}</span>`).join('')}
        </div>
    </div>
    ` : ''}

    ${hasSOV ? `
    <div class="section">
        <div class="section-title">Share of Voice (SOV)</div>
        <table>
            <thead><tr><th>Metric</th><th>Value</th></tr></thead>
            <tbody>${sovRows}</tbody>
        </table>
    </div>
    ` : ''}

    ${hasEfficiency ? `
    <div class="section">
        <div class="section-title">Efficiency Metrics</div>
        <table>
            <thead><tr><th>Metric</th><th>Value</th></tr></thead>
            <tbody>${efficiencyRows}</tbody>
        </table>
    </div>
    ` : ''}

    ${hasAVE ? `
    <div class="section">
        <div class="section-title">Advertising Value Equivalency (AVE)</div>
        <table>
            <thead><tr><th>Method</th><th>Value</th></tr></thead>
            <tbody>${aveRows}</tbody>
        </table>
    </div>
    ` : ''}

    ${aiAnalysis ? `
    <div class="section">
        <div class="section-title">AI-Powered Analysis</div>
        <div class="ai-analysis">${aiHTML}</div>
    </div>
    ` : ''}

    <div class="footer">
        Generated by Collaborative Intelligence &middot; ${date}
    </div>
</body>
</html>`;
}

function printReport(props: AVEExportProps): void {
    const html = buildPrintHTML(props);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        toast.error('Popup Blocked', { description: 'Please allow popups to print the report.' });
        return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

// ─── Share Link ──────────────────────────────────────────────────────────────

async function shareAnalysis(props: AVEExportProps): Promise<void> {
    try {
        const response = await fetch('/api/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                campaignInfo: props.campaignInfo,
                results: props.results,
                channels: props.channels,
                aiAnalysis: props.aiAnalysis,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create share link');
        }

        const data = await response.json();
        await navigator.clipboard.writeText(data.url);
        toast.success('Share link copied!', { description: 'The link has been copied to your clipboard.' });
    } catch {
        toast.error('Share Failed', { description: 'Could not generate share link. Please try again.' });
    }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AVEExport({ campaignInfo, results, channels, aiAnalysis }: AVEExportProps) {
    const hasResults = Object.keys(results).length > 0;

    return (
        <div className="flex items-center gap-2">
            <Button
                size="sm"
                variant="outline"
                disabled={!hasResults}
                onClick={() => downloadCSV({ campaignInfo, results, channels, aiAnalysis })}
                className="gap-1.5 text-xs"
            >
                <TableIcon className="h-3.5 w-3.5" />
                Download CSV
            </Button>

            <Button
                size="sm"
                variant="outline"
                disabled={!hasResults}
                onClick={() => printReport({ campaignInfo, results, channels, aiAnalysis })}
                className="gap-1.5 text-xs"
            >
                <PrinterIcon className="h-3.5 w-3.5" />
                Print Report
            </Button>

            <Button
                size="sm"
                variant="outline"
                disabled={!hasResults}
                onClick={() => shareAnalysis({ campaignInfo, results, channels, aiAnalysis })}
                className="gap-1.5 text-xs"
            >
                <LinkIcon className="h-3.5 w-3.5" />
                Share
            </Button>
        </div>
    );
}
