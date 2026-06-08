'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { IndexTrendPoint } from '@/types';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-slate-900 border border-lens-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-lens-text mb-1">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-lens-text-secondary">{entry.name}:</span>
          <span className="text-white font-medium">{entry.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

export default function IndexTrend({ data }: { data: IndexTrendPoint[] }) {
  // Show every 15th label to keep it clean
  const filteredTrend = data.map((d, i) => ({
    ...d,
    displayDate: i % 15 === 0 ? d.date : '',
  }));

  return (
    <div className="card p-4">
      <h3 className="text-sm font-display font-semibold text-lens-text mb-4">Reputation Index Trend (90 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[20, 90]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
          <Line type="monotone" dataKey="NSS" stroke="#14b8a6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="SI" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="EMSS" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
