'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { VolumeTrendPoint } from '@/types/lens';
import { CHART_GRID, CHART_AXIS_TICK } from '@/lib/chart-theme';

// Platform brand colors — kept (canonical platform identity)
const platformColors: Record<string, string> = {
  Twitter: '#1d9bf0',
  Instagram: '#e1306c',
  TikTok: '#00f2ea',
  YouTube: '#ff0000',
  Facebook: '#1877f2',
  'Online News': '#f59e0b',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-slate-900 border border-lens-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-lens-text mb-1">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-lens-text-secondary">{entry.name}:</span>
          <span className="text-white font-medium">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function VolumeTrend({ data }: { data: VolumeTrendPoint[] }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-display font-semibold text-lens-text mb-4">Volume Trend (7 Days)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID.stroke} />
          <XAxis dataKey="date" tick={CHART_AXIS_TICK} />
          <YAxis tick={CHART_AXIS_TICK} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', color: 'hsl(var(--foreground-soft))' }}
          />
          {Object.entries(platformColors).map(([key, color]) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
