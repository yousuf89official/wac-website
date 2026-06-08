import { useState, useMemo } from 'react';
import { useMasterData } from '@/contexts/MasterDataContext';
import type { Metric } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MetricManagerProps {
    selectedChannelIds: string[];
    selectedMetricIds: string[]; // From campaign config
    metricValues: Record<string, string | number>;
    onUpdateMetrics: (ids: string[], values: Record<string, string | number>) => void;
}

export const MetricManager = ({ selectedChannelIds, selectedMetricIds, metricValues, onUpdateMetrics }: MetricManagerProps) => {
    const { metrics } = useMasterData();
    const [isAddingMsg, setIsAddingMsg] = useState(false);
    const [metricToAdd, setMetricToAdd] = useState<string>('');

    // Filter metrics that belong to selected channels or cross-platform
    const availableMetricOptions = useMemo(() => {
        return metrics.filter(m =>
            (m.channelId === 'cross-platform' || (m.channelId && selectedChannelIds.includes(m.channelId))) &&
            !selectedMetricIds.includes(m.id) // Only show unselected ones
        );
    }, [selectedChannelIds, selectedMetricIds, metrics]);

    const activeMetrics = useMemo(() => {
        return selectedMetricIds.map(id => metrics.find(m => m.id === id)).filter(Boolean) as Metric[];
    }, [selectedMetricIds, metrics]);

    const handleValueChange = (id: string, val: string) => {
        onUpdateMetrics(selectedMetricIds, { ...metricValues, [id]: val });
    };

    const handleAddMetric = () => {
        if (!metricToAdd) return;
        const newIds = [...selectedMetricIds, metricToAdd];
        onUpdateMetrics(newIds, metricValues);
        setMetricToAdd('');
        setIsAddingMsg(false);
    };

    const handleRemoveMetric = (id: string) => {
        const newIds = selectedMetricIds.filter(mId => mId !== id);
        const newValues = { ...metricValues };
        delete newValues[id];
        onUpdateMetrics(newIds, newValues);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Label className="text-base">Campaign Metrics</Label>
                <Button size="sm" variant="outline" onClick={() => setIsAddingMsg(!isAddingMsg)}>
                    <Plus size={14} className="mr-2" /> Add Metric
                </Button>
            </div>

            {isAddingMsg && (
                <div className="p-4 bg-muted/30 rounded-lg border border-white/10 flex gap-2 animate-in slide-in-from-top-2">
                    <Select value={metricToAdd} onValueChange={setMetricToAdd}>
                        <SelectTrigger className="w-full bg-white/[0.04] border-white/10 text-white">
                            <SelectValue placeholder="Select a metric to add..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0f1a] border-white/10">
                            {availableMetricOptions.map(m => (
                                <SelectItem key={m.id} value={m.id} className="text-white/70 focus:bg-white/[0.08] focus:text-white">
                                    {m.label} <span className="text-muted-foreground text-xs ml-2">({m.channelId})</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleAddMetric}>Add</Button>
                </div>
            )}

            <div className="space-y-3">
                {activeMetrics.map((metric) => {
                    const isCrossPlatform = metric.channelId === 'cross-platform';
                    return (
                        <div key={metric.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/5 group hover:border-white/10 transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-white">{metric.label}</span>
                                    {isCrossPlatform && <Badge variant="secondary" className="text-[10px] h-4">Default</Badge>}
                                    {!isCrossPlatform && <Badge variant="outline" className="text-[10px] h-4">{metric.channelId}</Badge>}
                                </div>
                                <div className="text-xs text-muted-foreground capitalize">{metric.type} metric</div>
                            </div>

                            {/* Input Area */}
                            <div className="w-[150px]">
                                {metric.inputType === 'input' ? (
                                    <Input
                                        type={metric.type === 'number' ? 'number' : 'text'}
                                        placeholder={metric.type === 'number' ? '0' : 'Value'}
                                        className="h-8 text-sm"
                                        value={metricValues[metric.id] || ''}
                                        onChange={(e) => handleValueChange(metric.id, e.target.value)}
                                    />
                                ) : (
                                    <div className="text-sm font-medium text-right text-muted-foreground">Auto-calc</div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                {!isCrossPlatform && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                        onClick={() => handleRemoveMetric(metric.id)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                )}
                                {isCrossPlatform && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-muted-foreground opacity-50 cursor-not-allowed"
                                        disabled
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
