'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BarChart3, Copy, Trophy } from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChannelAVEResult {
    channel: string;
    impressions: number;
    engagements: number;
    videoViews: number;
    cpm: number;
    cpe: number;
    cpv: number;
    impressionAve: number;
    engagementAve: number;
    videoViewAve: number;
    totalAve: number;
}

interface ChannelBreakdownProps {
    selectedChannels: string[];
    onChannelAVECalculated: (results: ChannelAVEResult[]) => void;
}

interface ChannelRow {
    channel: string;
    impressions: string;
    engagements: string;
    videoViews: string;
    cpm: string;
    cpe: string;
    cpv: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatIDR = (value: number): string => {
    if (!value) return 'IDR 0';
    return `IDR ${new Intl.NumberFormat('id-ID').format(value)}`;
};

const parseNum = (val: string): number => {
    if (!val) return 0;
    return parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0;
};

const formatInputNumber = (value: string): string => {
    const num = value.replace(/[^\d]/g, '');
    if (!num) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(num));
};

const CHANNEL_LABELS: Record<string, string> = {
    'google-sem': 'Google SEM',
    'youtube': 'YouTube',
    'facebook': 'Facebook',
    'instagram': 'Instagram',
    'tiktok': 'TikTok',
    'snack-video': 'Snack Video',
    'linkedin': 'LinkedIn',
    'display-banner': 'Display Banner',
    'ott-ads': 'OTT Ads',
    'audio': 'Audio',
    'dooh': 'DOOH',
    'kol': 'KOL',
    'pr': 'PR',
};

// ─── Component ──────────────────────────────────────────────────────────────

export const ChannelBreakdown = ({ selectedChannels, onChannelAVECalculated }: ChannelBreakdownProps) => {
    const [rows, setRows] = useState<Record<string, ChannelRow>>({});
    const [results, setResults] = useState<ChannelAVEResult[]>([]);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize rows for selected channels
    useEffect(() => {
        setRows((prev) => {
            const next: Record<string, ChannelRow> = {};
            for (const ch of selectedChannels) {
                next[ch] = prev[ch] || {
                    channel: ch,
                    impressions: '',
                    engagements: '',
                    videoViews: '',
                    cpm: '',
                    cpe: '',
                    cpv: '',
                };
            }
            return next;
        });
    }, [selectedChannels]);

    // Debounced calculation
    const calculate = useCallback(() => {
        const channelResults: ChannelAVEResult[] = selectedChannels.map((ch) => {
            const row = rows[ch];
            if (!row) {
                return {
                    channel: ch, impressions: 0, engagements: 0, videoViews: 0,
                    cpm: 0, cpe: 0, cpv: 0,
                    impressionAve: 0, engagementAve: 0, videoViewAve: 0, totalAve: 0,
                };
            }
            const impressions = parseNum(row.impressions);
            const engagements = parseNum(row.engagements);
            const videoViews = parseNum(row.videoViews);
            const cpm = parseNum(row.cpm);
            const cpe = parseNum(row.cpe);
            const cpv = parseNum(row.cpv);

            const impressionAve = (impressions / 1000) * cpm;
            const engagementAve = engagements * cpe;
            const videoViewAve = videoViews * cpv;
            const totalAve = impressionAve + engagementAve + videoViewAve;

            return {
                channel: ch, impressions, engagements, videoViews,
                cpm, cpe, cpv,
                impressionAve, engagementAve, videoViewAve, totalAve,
            };
        });
        setResults(channelResults);
        onChannelAVECalculated(channelResults);
    }, [rows, selectedChannels, onChannelAVECalculated]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(calculate, 400);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [calculate]);

    const updateRow = (channel: string, field: keyof ChannelRow, rawValue: string) => {
        const value = rawValue.replace(/[^\d]/g, '');
        setRows((prev) => ({
            ...prev,
            [channel]: { ...prev[channel], [field]: value },
        }));
    };

    // Apply first channel's CPM/CPE/CPV to all channels
    const applyToAll = () => {
        const firstChannel = selectedChannels[0];
        if (!firstChannel || !rows[firstChannel]) return;
        const { cpm, cpe, cpv } = rows[firstChannel];
        setRows((prev) => {
            const next = { ...prev };
            for (const ch of selectedChannels) {
                if (next[ch]) {
                    next[ch] = { ...next[ch], cpm, cpe, cpv };
                }
            }
            return next;
        });
        toast.success('Cost values applied to all channels');
    };

    // Determine top performer
    const topPerformer = results.reduce<string | null>((best, r) => {
        const spend = r.cpm + r.cpe + r.cpv;
        if (spend === 0 || r.totalAve === 0) return best;
        if (!best) return r.channel;
        const bestResult = results.find((x) => x.channel === best);
        if (!bestResult) return r.channel;
        const bestSpend = bestResult.cpm + bestResult.cpe + bestResult.cpv;
        if (bestSpend === 0) return r.channel;
        return (r.totalAve / spend) > (bestResult.totalAve / bestSpend) ? r.channel : best;
    }, null);

    // Summary totals
    const totals = results.reduce(
        (acc, r) => ({
            impressions: acc.impressions + r.impressions,
            engagements: acc.engagements + r.engagements,
            videoViews: acc.videoViews + r.videoViews,
            totalAve: acc.totalAve + r.totalAve,
        }),
        { impressions: 0, engagements: 0, videoViews: 0, totalAve: 0 }
    );

    if (selectedChannels.length === 0) return null;

    return (
        <Card className="bg-card border border-border">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        Per-Channel Breakdown
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={applyToAll}
                        className="h-7 text-xs border-border hover:bg-card/80"
                    >
                        <Copy className="w-3 h-3 mr-1.5" />
                        Apply Costs to All
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Enter metrics and cost rates per channel. AVE auto-calculates as you type.
                </p>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-3 w-[130px]">Channel</th>
                                <th className="text-right text-xs font-medium text-muted-foreground pb-2 px-1.5">Impressions</th>
                                <th className="text-right text-xs font-medium text-muted-foreground pb-2 px-1.5">Engagements</th>
                                <th className="text-right text-xs font-medium text-muted-foreground pb-2 px-1.5">Video Views</th>
                                <th className="text-right text-xs font-medium text-muted-foreground pb-2 px-1.5">CPM (IDR)</th>
                                <th className="text-right text-xs font-medium text-muted-foreground pb-2 px-1.5">CPE (IDR)</th>
                                <th className="text-right text-xs font-medium text-muted-foreground pb-2 px-1.5">CPV (IDR)</th>
                                <th className="text-right text-xs font-medium text-muted-foreground pb-2 pl-3">AVE Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedChannels.map((ch) => {
                                const row = rows[ch];
                                const result = results.find((r) => r.channel === ch);
                                const isTop = topPerformer === ch;

                                return (
                                    <tr
                                        key={ch}
                                        className={`border-b border-border transition-colors ${
                                            isTop ? 'bg-success/10 border-success/20' : ''
                                        }`}
                                    >
                                        <td className="py-1.5 pr-3">
                                            <div className="flex items-center gap-1.5">
                                                {isTop && <Trophy className="w-3 h-3 text-success shrink-0" />}
                                                <span className="text-xs font-medium truncate">
                                                    {CHANNEL_LABELS[ch] || ch}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-1.5 px-1">
                                            <Input
                                                value={row ? formatInputNumber(row.impressions) : ''}
                                                onChange={(e) => updateRow(ch, 'impressions', e.target.value)}
                                                placeholder="0"
                                                className="h-8 text-xs text-right bg-card border-border"
                                            />
                                        </td>
                                        <td className="py-1.5 px-1">
                                            <Input
                                                value={row ? formatInputNumber(row.engagements) : ''}
                                                onChange={(e) => updateRow(ch, 'engagements', e.target.value)}
                                                placeholder="0"
                                                className="h-8 text-xs text-right bg-card border-border"
                                            />
                                        </td>
                                        <td className="py-1.5 px-1">
                                            <Input
                                                value={row ? formatInputNumber(row.videoViews) : ''}
                                                onChange={(e) => updateRow(ch, 'videoViews', e.target.value)}
                                                placeholder="0"
                                                className="h-8 text-xs text-right bg-card border-border"
                                            />
                                        </td>
                                        <td className="py-1.5 px-1">
                                            <Input
                                                value={row ? formatInputNumber(row.cpm) : ''}
                                                onChange={(e) => updateRow(ch, 'cpm', e.target.value)}
                                                placeholder="0"
                                                className="h-8 text-xs text-right bg-card border-border"
                                            />
                                        </td>
                                        <td className="py-1.5 px-1">
                                            <Input
                                                value={row ? formatInputNumber(row.cpe) : ''}
                                                onChange={(e) => updateRow(ch, 'cpe', e.target.value)}
                                                placeholder="0"
                                                className="h-8 text-xs text-right bg-card border-border"
                                            />
                                        </td>
                                        <td className="py-1.5 px-1">
                                            <Input
                                                value={row ? formatInputNumber(row.cpv) : ''}
                                                onChange={(e) => updateRow(ch, 'cpv', e.target.value)}
                                                placeholder="0"
                                                className="h-8 text-xs text-right bg-card border-border"
                                            />
                                        </td>
                                        <td className="py-1.5 pl-3">
                                            <div className="text-xs font-semibold text-right text-primary">
                                                {formatIDR(result?.totalAve || 0)}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-border">
                                <td className="py-2 pr-3">
                                    <span className="text-xs font-bold">TOTAL</span>
                                </td>
                                <td className="py-2 px-1 text-right text-xs font-medium">
                                    {new Intl.NumberFormat('id-ID').format(totals.impressions)}
                                </td>
                                <td className="py-2 px-1 text-right text-xs font-medium">
                                    {new Intl.NumberFormat('id-ID').format(totals.engagements)}
                                </td>
                                <td className="py-2 px-1 text-right text-xs font-medium">
                                    {new Intl.NumberFormat('id-ID').format(totals.videoViews)}
                                </td>
                                <td className="py-2 px-1" colSpan={3}>
                                    <div className="text-xs text-muted-foreground text-center">-</div>
                                </td>
                                <td className="py-2 pl-3">
                                    <div className="text-sm font-bold text-right text-primary">
                                        {formatIDR(totals.totalAve)}
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {topPerformer && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20">
                        <Trophy className="w-3.5 h-3.5 text-success" />
                        <span className="text-xs text-success">
                            Top performer: <strong>{CHANNEL_LABELS[topPerformer] || topPerformer}</strong> (best AVE/cost ratio)
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
