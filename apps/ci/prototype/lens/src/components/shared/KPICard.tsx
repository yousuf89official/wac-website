'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: number;
  format?: 'number' | 'percent' | 'score' | 'reach';
  delta?: number;
  deltaLabel?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}

function formatValue(value: number, format?: string): string {
  switch (format) {
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'score':
      return value.toFixed(1);
    case 'reach':
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
      return value.toString();
    default:
      return value.toLocaleString('en-US');
  }
}

export default function KPICard({ label, value, format, delta, deltaLabel, icon, accentColor }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-lens-text-muted uppercase tracking-wider">{label}</span>
        {icon && <div className="text-lens-text-muted">{icon}</div>}
      </div>
      <div className="flex items-end gap-3">
        <span
          className="text-2xl font-display font-bold text-white animate-count"
          style={accentColor ? { color: accentColor } : undefined}
        >
          {formatValue(displayValue, format)}
        </span>
        {delta !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium pb-0.5 ${
            delta >= 0 ? 'text-lens-positive' : 'text-lens-negative'
          }`}>
            {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}%</span>
            {deltaLabel && <span className="text-lens-text-muted ml-1">{deltaLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
