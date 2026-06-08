import { useEffect, useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Service } from '@/services/api';
import { CHART_COLORS, seriesColor, CHART_GRID, CHART_AXIS_TICK, CHART_TOOLTIP } from '@/lib/chart-theme';

export const PerformanceWidgets = ({ brandId, campaignId }: { brandId?: string, campaignId?: string }) => {
    const [trendData, setTrendData] = useState<any[]>([]);
    const [auditData, setAuditData] = useState<any[]>([]);

    useEffect(() => {
        Service.analytics.get(brandId, campaignId).then(data => {
            setTrendData(data.trend);
            setAuditData(data.demographics);
        });
    }, [brandId, campaignId]);

    // Fallback if no data
    if (trendData.length === 0) {
        return <div className="p-12 text-center text-muted-foreground w-full col-span-3">Loading Performance Data...</div>;
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {/* Engagement Trend */}
            <Card className="col-span-2 lg:col-span-2 bg-card/50 backdrop-blur-sm border-white/5">
                <CardHeader>
                    <CardTitle>Content Engagement Trend</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID.stroke} vertical={false} />
                            <XAxis dataKey="date" tick={CHART_AXIS_TICK} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis tick={CHART_AXIS_TICK} fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip {...CHART_TOOLTIP} />
                            <Line type="monotone" dataKey="value" stroke={CHART_COLORS.primary} strokeWidth={3} dot={{ fill: CHART_COLORS.primary, r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Demographics */}
            <Card className="bg-card/50 backdrop-blur-sm border-white/5">
                <CardHeader>
                    <CardTitle>Audience Age</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={auditData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {auditData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={seriesColor(index)} />
                                ))}
                            </Pie>
                            <Tooltip {...CHART_TOOLTIP} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-4">
                        {auditData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seriesColor(index) }} />
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
