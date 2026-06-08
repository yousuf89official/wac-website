'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { History, Trash2, Calculator, Clock } from 'lucide-react';
import { api } from '@/services/api';

interface SavedAnalysis {
    id: string;
    brandId: string;
    campaignId?: string;
    name: string;
    inputs: string;
    results: string;
    aiAnalysis?: string;
    channels?: string;
    createdAt: string;
    updatedAt: string;
}

interface CalculationHistoryProps {
    brandId?: string;
    onLoad: (analysis: any) => void;
}

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

function parseJsonSafe<T>(raw: string | undefined | null, fallback: T): T {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function formatIDRCompact(value: number): string {
    if (value >= 1_000_000_000) return `IDR ${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `IDR ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `IDR ${(value / 1_000).toFixed(1)}K`;
    return `IDR ${value.toLocaleString('id-ID')}`;
}

export const CalculationHistory = ({ brandId, onLoad }: CalculationHistoryProps) => {
    const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchAnalyses = useCallback(async () => {
        setLoading(true);
        try {
            const query: Record<string, string> = {};
            if (brandId) query.brandId = brandId;
            const data = await api.mediaAnalysis.getAll(query);
            setAnalyses(data);
        } catch {
            // Error handled by fetchClient
        } finally {
            setLoading(false);
        }
    }, [brandId]);

    useEffect(() => {
        fetchAnalyses();
    }, [fetchAnalyses]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeletingId(id);
        try {
            await api.mediaAnalysis.delete(id);
            setAnalyses((prev) => prev.filter((a) => a.id !== id));
            toast.success('Analysis deleted');
        } catch {
            toast.error('Failed to delete analysis');
        } finally {
            setDeletingId(null);
        }
    };

    const handleLoad = (analysis: SavedAnalysis) => {
        const inputs = parseJsonSafe<Record<string, string>>(analysis.inputs, {});
        const results = parseJsonSafe<Record<string, string>>(analysis.results, {});
        const channels = parseJsonSafe<string[] | undefined>(analysis.channels, undefined);
        onLoad({
            inputs,
            results,
            aiAnalysis: analysis.aiAnalysis || undefined,
            channels: channels || undefined,
        });
        toast.success('Analysis loaded', { description: analysis.name });
    };

    return (
        <Card className="bg-card border border-border w-full max-w-[300px]">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Saved Calculations
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                    </div>
                ) : analyses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Calculator className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-xs">No saved calculations</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                        {analyses.map((analysis) => {
                            const results = parseJsonSafe<Record<string, string>>(analysis.results, {});
                            const weightedAve = results.weightedAve ? parseFloat(results.weightedAve) : null;
                            const inputs = parseJsonSafe<Record<string, string>>(analysis.inputs, {});

                            return (
                                <button
                                    key={analysis.id}
                                    type="button"
                                    onClick={() => handleLoad(analysis)}
                                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/40 transition-all cursor-pointer hover:bg-card/80 group"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold truncate">{analysis.name}</p>
                                            {inputs.campaignName && (
                                                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                                    {inputs.campaignName}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                            onClick={(e) => handleDelete(analysis.id, e)}
                                            disabled={deletingId === analysis.id}
                                        >
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        {weightedAve !== null && (
                                            <span className="text-[10px] font-medium text-primary">
                                                {formatIDRCompact(weightedAve)}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto">
                                            <Clock className="w-2.5 h-2.5" />
                                            {timeAgo(analysis.createdAt)}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
