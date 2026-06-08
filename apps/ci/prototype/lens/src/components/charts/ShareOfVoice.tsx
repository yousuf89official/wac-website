'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ShareOfVoiceData } from '@/types';

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

export default function ShareOfVoice({ data }: { data: ShareOfVoiceData[] }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-display font-semibold text-lens-text mb-4">Share of Voice</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis dataKey="brand" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={120} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="positive" stackId="a" fill="#22c55e" />
          <Bar dataKey="neutral" stackId="a" fill="#64748b" />
          <Bar dataKey="negative" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
