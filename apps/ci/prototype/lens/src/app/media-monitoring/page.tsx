'use client';

import { useEffect, useState, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, Clock, Send } from 'lucide-react';
import PeakTimeHeatmap from '@/components/charts/PeakTimeHeatmap';
import ShareOfVoice from '@/components/charts/ShareOfVoice';
import ReviewQueue from '@/components/panels/ReviewQueue';
import {
  sourceBreakdown as mockSourceBreakdown,
  reportSchedules,
  heatmapData as mockHeatmap,
  shareOfVoice as mockSoV,
  mentions as mockMentions,
} from '@/lib/mock/data';
import type { SourceBreakdown } from '@/types';

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900 border border-lens-border rounded-lg px-3 py-2 shadow-xl">
      <div className="flex items-center gap-2 text-xs">
        <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
        <span className="text-lens-text-secondary">{d.name}:</span>
        <span className="text-white font-medium">{d.value}%</span>
      </div>
    </div>
  );
};

function SourceBreakdownChart({ data }: { data: SourceBreakdown[] }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-display font-semibold text-lens-text mb-4">Source Breakdown</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={85}
            dataKey="value"
            label={({ name, value }) => `${name} ${value}%`}
            labelLine={false}
            animationDuration={800}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function ReportScheduler() {
  const formRef = useRef<HTMLDivElement>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [reportName, setReportName] = useState('');
  const [frequency, setFrequency] = useState('Mingguan');
  const [recipients, setRecipients] = useState('');
  const [format, setFormat] = useState('PDF');

  const handleNewSchedule = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      const input = formRef.current?.querySelector('input');
      (input as HTMLInputElement | null)?.focus();
    }, 400);
  };

  const handleSend = (id: string) => {
    setSendingId(id);
    setTimeout(() => setSendingId(null), 1500);
  };

  const handleSchedule = () => {
    if (!reportName.trim()) return;
    setScheduling(true);
    setTimeout(() => {
      setScheduling(false);
      setReportName('');
      setRecipients('');
    }, 1800);
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-semibold text-lens-text">Report Scheduler</h3>
        <button
          onClick={handleNewSchedule}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-lens-accent/15 text-lens-accent hover:bg-lens-accent/25 transition-colors"
        >
          <Calendar size={12} /> New Schedule
        </button>
      </div>
      <div className="space-y-2">
        {reportSchedules.map((sched) => (
          <div key={sched.id} className="flex items-center justify-between p-3 rounded-lg border border-lens-border bg-lens-bg/50">
            <div>
              <div className="text-xs font-medium text-lens-text">{sched.name}</div>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-lens-text-muted">
                <span className="flex items-center gap-1"><Clock size={10} /> {sched.frequency}</span>
                <span>Next: {sched.nextRun}</span>
                <span>{sched.format}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-lens-text-muted">{sched.recipients.length} recipient(s)</span>
              <button
                onClick={() => handleSend(sched.id)}
                disabled={sendingId === sched.id}
                className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${sendingId === sched.id ? 'text-lens-accent' : 'text-lens-text-muted'}`}
                title="Send now"
              >
                <Send size={12} className={sendingId === sched.id ? 'animate-pulse' : ''} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inline form */}
      <div ref={formRef} className="mt-4 p-3 rounded-lg border border-dashed border-lens-border bg-lens-bg/30">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-lens-text-muted block mb-1">Report Name</label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="input-field w-full text-xs"
              placeholder="e.g. Weekly Summary"
            />
          </div>
          <div>
            <label className="text-[10px] text-lens-text-muted block mb-1">Frequency</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="input-field w-full text-xs">
              <option>Harian</option>
              <option>Mingguan</option>
              <option>Bulanan</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-lens-text-muted block mb-1">Recipients</label>
            <input
              type="text"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              className="input-field w-full text-xs"
              placeholder="email@company.com"
            />
          </div>
          <div>
            <label className="text-[10px] text-lens-text-muted block mb-1">Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="input-field w-full text-xs">
              <option>PDF</option>
              <option>Email</option>
              <option>PDF + PPTX</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleSchedule}
          disabled={scheduling}
          className="btn-primary text-xs mt-3 w-full"
        >
          {scheduling ? 'Scheduling...' : 'Schedule Report'}
        </button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-lens-card rounded w-1/3" />
      <div className="grid grid-cols-3 gap-3">
        <div className="card h-64" />
        <div className="col-span-2 card h-64" />
      </div>
      <div className="card h-64" />
    </div>
  );
}

export default function MediaMonitoringPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then((r) => r.json()),
      fetch('/api/mentions').then((r) => r.json()),
    ])
      .then(([analyticsRes, mentionsRes]) => {
        setData({
          ...analyticsRes.data,
          mentions: mentionsRes.data,
        });
      })
      .catch(() => {
        setData({
          sourceBreakdown: mockSourceBreakdown,
          heatmapData: mockHeatmap,
          shareOfVoice: mockSoV,
          mentions: mockMentions,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-lg font-display font-bold text-white">Media Monitoring Pro</h1>
        <p className="text-xs text-lens-text-muted mt-0.5">Layer 2 — Advanced media analytics with source breakdown and review tools</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SourceBreakdownChart data={data?.sourceBreakdown || mockSourceBreakdown} />
        <div className="col-span-2">
          <PeakTimeHeatmap data={data?.heatmapData || mockHeatmap} />
        </div>
      </div>

      <ShareOfVoice data={data?.shareOfVoice || mockSoV} />

      <div className="grid grid-cols-2 gap-3">
        <ReviewQueue data={data?.mentions || mockMentions} />
        <ReportScheduler />
      </div>
    </div>
  );
}
