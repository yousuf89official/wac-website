'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { SentimentData } from '@/types/lens';

const CustomTooltip = ({ active, payload, total }: any) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900 border border-lens-border rounded-lg px-3 py-2 shadow-xl">
      <div className="flex items-center gap-2 text-xs">
        <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
        <span className="capitalize text-lens-text-secondary">{d.name}:</span>
        <span className="text-white font-medium">{d.value.toLocaleString()}</span>
        <span className="text-lens-text-muted">({((d.value / total) * 100).toFixed(1)}%)</span>
      </div>
    </div>
  );
};

export default function SentimentDonut({ data }: { data: SentimentData[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="card p-4">
      <h3 className="text-sm font-display font-semibold text-lens-text mb-4">Sentiment Distribution</h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-display font-bold text-white">{total.toLocaleString()}</span>
          <span className="text-xs text-lens-text-muted">Total</span>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs text-lens-text-secondary">
            <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            <span className="capitalize">{d.name}</span>
            <span className="text-lens-text-muted">({((d.value / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
