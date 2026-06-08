'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, Info, Shield, Sparkles } from 'lucide-react';
import CrisisTimeline from '@/components/panels/CrisisTimeline';
import AlertRulesManager from '@/components/panels/AlertRulesManager';
import {
  crisisAlerts as mockCrisisAlerts,
  crisisTimeline as mockCrisisTimeline,
  negativeAmplifiers as mockAmplifiers,
  alertRules as mockAlertRules,
  mentions as mockMentions,
} from '@/lib/mock/data';
import type { Severity, CrisisAlert, NegativeAmplifier, Mention } from '@/types';

const severityConfig: Record<Severity, { bg: string; border: string; icon: React.ElementType; text: string }> = {
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: AlertTriangle, text: 'text-red-400' },
  high: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: AlertTriangle, text: 'text-orange-400' },
  medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: AlertCircle, text: 'text-yellow-400' },
  low: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Info, text: 'text-blue-400' },
};

function ActiveAlertBanner({ alerts, onAcknowledge }: { alerts: CrisisAlert[]; onAcknowledge: (id: string) => void }) {
  const activeAlerts = alerts.filter((a) => a.active);
  if (activeAlerts.length === 0) return null;

  const topAlert = activeAlerts[0];
  const config = severityConfig[topAlert.severity];
  const Icon = config.icon;

  return (
    <div className={`sticky top-0 z-20 ${config.bg} ${config.border} border rounded-lg p-3 flex items-start gap-3`}>
      <Icon size={18} className={`${config.text} shrink-0 mt-0.5`} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${config.text}`}>{topAlert.title}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${config.bg} ${config.text} border ${config.border}`}>
            {topAlert.severity}
          </span>
          <span className="text-[10px] text-lens-text-muted">{topAlert.time}</span>
        </div>
        <p className="text-xs text-lens-text-secondary mt-1">{topAlert.description}</p>
      </div>
      <button
        onClick={() => onAcknowledge(topAlert.id)}
        className="btn-secondary text-[10px] py-1 px-2 shrink-0"
      >
        Acknowledge
      </button>
    </div>
  );
}

function LiveMentionFeed({ initialMentions }: { initialMentions: Mention[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liveMentions, setLiveMentions] = useState(initialMentions.filter((m) => m.sentiment === 'negative').slice(0, 4));

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMentions((prev) => {
        const pool = initialMentions.filter((m) => m.sentiment === 'negative');
        const newMention = { ...pool[Math.floor(Math.random() * pool.length)], id: Date.now().toString(), time: 'just now' };
        return [newMention, ...prev].slice(0, 10);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [initialMentions]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [liveMentions]);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-display font-semibold text-lens-text">Live Negative Feed</h3>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-[10px] text-red-400 font-medium">LIVE</span>
        </div>
      </div>
      <div ref={scrollRef} className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {liveMentions.map((m) => (
          <div key={m.id} className="p-2.5 rounded-lg border border-red-500/20 bg-red-500/5 animate-slide-up">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-lens-text">{m.username}</span>
              <span className="text-[10px] text-lens-text-muted">{m.platform} · {m.time}</span>
            </div>
            <p className="text-xs text-red-300/80 line-clamp-2">{m.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopNegativeAmplifiers({ data }: { data: NegativeAmplifier[] }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-display font-semibold text-lens-text mb-4">Top Negative Amplifiers</h3>
      <div className="space-y-2">
        {data.map((amp) => (
          <div key={amp.rank} className="flex items-center gap-3 p-2 rounded-lg hover:bg-lens-card-hover/30 transition-colors">
            <span className="text-sm font-bold text-lens-text-muted w-5 text-center">{amp.rank}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-lens-text">{amp.username}</span>
                <span className="text-[10px] text-lens-text-muted">{amp.platform}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-lens-text-muted">
                <span>{(amp.followers / 1_000_000).toFixed(1)}M followers</span>
                <span>{amp.mentions} mentions</span>
                <span className="text-red-400">{(amp.reachEstimate / 1_000_000).toFixed(1)}M est. reach</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SituationRoom() {
  const [generating, setGenerating] = useState(false);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={16} className="text-lens-accent" />
        <h3 className="text-sm font-display font-semibold text-lens-text">Situation Room</h3>
      </div>
      <div className="p-3 rounded-lg bg-lens-bg/50 border border-lens-border mb-3">
        <h4 className="text-xs font-semibold text-lens-text mb-2">Narrative Summary</h4>
        <p className="text-xs text-lens-text-secondary leading-relaxed">
          Keluhan utama terkait <span className="text-white font-medium">keterlambatan pengiriman unit MG 4</span> mulai viral di Twitter sejak pukul 14:00 WIB. Thread oleh @otomotif_daily (2.4M followers) memicu gelombang sentimen negatif dengan 5,200+ retweets.
          Isu ini berpotensi mempengaruhi persepsi brand terutama di segmen calon pembeli yang sedang mempertimbangkan MG 4 vs kompetitor.
          Tim PR telah menyiapkan respons resmi. Rekomendasi: (1) Publikasi statement transparansi, (2) DM langsung ke top complainers, (3) Update jadwal pengiriman di website.
        </p>
      </div>
      <button
        onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2000); }}
        className="btn-primary text-xs w-full flex items-center justify-center gap-2"
      >
        <Sparkles size={14} />
        {generating ? 'Generating Response Draft...' : 'Generate Response Draft'}
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-lens-card rounded w-1/3" />
      <div className="card h-20" />
      <div className="grid grid-cols-2 gap-3">
        <div className="card h-80" />
        <div className="card h-80" />
      </div>
    </div>
  );
}

export default function CrisisPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [mentionsData, setMentionsData] = useState<Mention[]>(mockMentions);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());

  const handleAcknowledge = (id: string) => {
    setAcknowledgedIds((prev) => new Set([...prev, id]));
  };

  const activeAlerts = (data?.crisisAlerts || mockCrisisAlerts).map((a: CrisisAlert) =>
    acknowledgedIds.has(a.id) ? { ...a, active: false } : a
  );

  useEffect(() => {
    Promise.all([
      fetch('/api/alerts').then((r) => r.json()),
      fetch('/api/mentions').then((r) => r.json()),
    ])
      .then(([alertsRes, mentionsRes]) => {
        setData(alertsRes.data);
        setMentionsData(mentionsRes.data);
      })
      .catch(() => {
        setData({
          crisisAlerts: mockCrisisAlerts,
          crisisTimeline: mockCrisisTimeline,
          negativeAmplifiers: mockAmplifiers,
          alertRules: mockAlertRules,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-lg font-display font-bold text-white">Crisis Intelligence</h1>
        <p className="text-xs text-lens-text-muted mt-0.5">Layer 3 — Real-time crisis detection, escalation, and response management</p>
      </div>

      <ActiveAlertBanner alerts={activeAlerts} onAcknowledge={handleAcknowledge} />

      <div className="grid grid-cols-2 gap-3">
        <CrisisTimeline data={data?.crisisTimeline || mockCrisisTimeline} />
        <LiveMentionFeed initialMentions={mentionsData} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TopNegativeAmplifiers data={data?.negativeAmplifiers || mockAmplifiers} />
        <SituationRoom />
      </div>

      <AlertRulesManager data={data?.alertRules || mockAlertRules} />
    </div>
  );
}
