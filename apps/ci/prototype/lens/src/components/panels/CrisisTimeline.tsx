'use client';

import { CheckCircle, Circle, Clock } from 'lucide-react';
import type { CrisisTimelineStep } from '@/types';

const statusConfig = {
  resolved: { icon: CheckCircle, color: 'text-green-400', lineColor: 'bg-green-400', bgColor: 'bg-green-500/10' },
  active: { icon: Circle, color: 'text-lens-accent', lineColor: 'bg-lens-accent', bgColor: 'bg-teal-500/10' },
  pending: { icon: Clock, color: 'text-lens-text-muted', lineColor: 'bg-lens-border', bgColor: 'bg-slate-800/50' },
};

export default function CrisisTimeline({ data }: { data: CrisisTimelineStep[] }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-display font-semibold text-lens-text mb-4">Crisis Timeline</h3>
      <div className="space-y-0">
        {data.map((step, idx) => {
          const config = statusConfig[step.status];
          const Icon = config.icon;
          const isLast = idx === data.length - 1;

          return (
            <div key={step.id} className="flex gap-3">
              {/* Timeline line and icon */}
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${config.bgColor}`}>
                  <Icon size={14} className={config.color} />
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 min-h-[24px] ${config.lineColor} opacity-30`} />
                )}
              </div>

              {/* Content */}
              <div className="pb-4 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${config.color}`}>{step.title}</span>
                  <span className="text-[10px] text-lens-text-muted">{step.time}</span>
                </div>
                <p className="text-xs text-lens-text-secondary mt-0.5">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
