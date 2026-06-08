'use client';

import type { HeatmapCell } from '@/types/lens';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = Array.from({ length: 24 }, (_, i) => i);

export default function PeakTimeHeatmap({ data }: { data: HeatmapCell[] }) {
  const maxValue = Math.max(...data.map((c) => c.value));

  const getColor = (value: number) => {
    const intensity = value / maxValue;
    if (intensity > 0.8) return 'bg-primary';
    if (intensity > 0.6) return 'bg-primary';
    if (intensity > 0.4) return 'bg-primary';
    if (intensity > 0.2) return 'bg-primary';
    return 'bg-primary';
  };

  const getOpacity = (value: number) => {
    return 0.2 + (value / maxValue) * 0.8;
  };

  return (
    <div className="card p-4">
      <h3 className="text-sm font-display font-semibold text-lens-text mb-4">Peak Time Heatmap</h3>
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Hour labels */}
          <div className="flex ml-10 mb-1">
            {hours.map((h) => (
              <div key={h} className="flex-1 text-center text-[9px] text-lens-text-muted">
                {h % 3 === 0 ? `${h}:00` : ''}
              </div>
            ))}
          </div>
          {/* Grid */}
          {days.map((day) => (
            <div key={day} className="flex items-center gap-1 mb-0.5">
              <span className="w-9 text-right text-[10px] text-lens-text-muted font-medium shrink-0">{day}</span>
              <div className="flex flex-1 gap-[2px]">
                {hours.map((hour) => {
                  const cell = data.find((c) => c.day === day && c.hour === hour);
                  const value = cell?.value || 0;
                  return (
                    <div
                      key={hour}
                      className={`flex-1 aspect-[2] rounded-[2px] ${getColor(value)} transition-colors cursor-default`}
                      style={{ opacity: getOpacity(value) }}
                      title={`${day} ${hour}:00 — ${value} mentions`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-3">
            <span className="text-[10px] text-lens-text-muted">Less</span>
            <div className="flex gap-[2px]">
              {[0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
                <div
                  key={intensity}
                  className="w-3 h-3 rounded-[2px] bg-primary"
                  style={{ opacity: intensity }}
                />
              ))}
            </div>
            <span className="text-[10px] text-lens-text-muted">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
