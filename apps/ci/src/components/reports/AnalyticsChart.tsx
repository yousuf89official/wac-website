'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { CHART_COLORS, CHART_GRID, CHART_AXIS_TICK } from '@/lib/chart-theme';

interface AnalyticsChartProps {
    data: any[];
    type: 'area' | 'bar';
    dataKey: string;
    color?: string;
    height?: number;
    showGrid?: boolean;
}

export const AnalyticsChart = ({
    data,
    type,
    dataKey,
    color = CHART_COLORS.primary,
    height = 300,
    showGrid = true
}: AnalyticsChartProps) => {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border border-border p-4 rounded-xl shadow-xl">
                    <p className="text-[10px] font-black text-foreground-soft uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-sm font-black text-foreground">
                        {payload[0].value.toLocaleString()}
                        <span className="text-foreground-soft font-bold ml-1 uppercase">{dataKey}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer>
                {type === 'area' ? (
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID.stroke} />}
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ ...CHART_AXIS_TICK, fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ ...CHART_AXIS_TICK, fontSize: 10, fontWeight: 700 }}
                            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                ) : (
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID.stroke} />}
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ ...CHART_AXIS_TICK, fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ ...CHART_AXIS_TICK, fontSize: 10, fontWeight: 700 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? color : `${color}88`} />
                            ))}
                        </Bar>
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};
