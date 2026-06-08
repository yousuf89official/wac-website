'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TopicData } from '@/types/lens';
import { CHART_SENTIMENT, CHART_GRID, CHART_AXIS_TICK } from '@/lib/chart-theme';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-slate-900 border border-lens-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-lens-text mb-1">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="capitalize text-lens-text-secondary">{entry.name}:</span>
          <span className="text-white font-medium">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function TopicsBar({ data }: { data: TopicData[] }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-display font-semibold text-lens-text mb-4">Top Topics by Sentiment</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID.stroke} horizontal={false} />
          <XAxis type="number" tick={CHART_AXIS_TICK} />
          <YAxis dataKey="topic" type="category" tick={CHART_AXIS_TICK} width={80} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="positive" stackId="a" fill={CHART_SENTIMENT.positive} radius={[0, 0, 0, 0]} />
          <Bar dataKey="neutral" stackId="a" fill={CHART_SENTIMENT.neutral} />
          <Bar dataKey="negative" stackId="a" fill={CHART_SENTIMENT.negative} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
