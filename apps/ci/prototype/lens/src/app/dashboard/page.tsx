'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, TrendingUp, Target, Eye } from 'lucide-react';
import KPICard from '@/components/shared/KPICard';
import VolumeTrend from '@/components/charts/VolumeTrend';
import SentimentDonut from '@/components/charts/SentimentDonut';
import TopicsBar from '@/components/charts/TopicsBar';
import WordCloud from '@/components/charts/WordCloud';
import MentionFeed from '@/components/panels/MentionFeed';
import {
  socialKPIs as mockKPIs,
  volumeTrend as mockVolumeTrend,
  sentimentData as mockSentimentData,
  topTopics as mockTopTopics,
  wordCloudItems as mockWordCloud,
  mentions as mockMentions,
} from '@/lib/mock/data';

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-lens-card rounded w-1/3" />
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 card h-80" />
        <div className="card h-80" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [mentionsData, setMentionsData] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1800);
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then((r) => r.json()),
      fetch('/api/mentions').then((r) => r.json()),
    ])
      .then(([analyticsRes, mentionsRes]) => {
        setAnalytics(analyticsRes.data);
        setMentionsData(mentionsRes.data);
      })
      .catch(() => {
        // Fallback to mock data
        setAnalytics({
          socialKPIs: mockKPIs,
          volumeTrend: mockVolumeTrend,
          sentimentData: mockSentimentData,
          topTopics: mockTopTopics,
          wordCloudItems: mockWordCloud,
        });
        setMentionsData(mockMentions);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  const kpis = analytics?.socialKPIs || mockKPIs;
  const volTrend = analytics?.volumeTrend || mockVolumeTrend;
  const sentData = analytics?.sentimentData || mockSentimentData;
  const topics = analytics?.topTopics || mockTopTopics;
  const words = analytics?.wordCloudItems || mockWordCloud;
  const mentionsList = mentionsData || mockMentions;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-bold text-white">Social Listening</h1>
          <p className="text-xs text-lens-text-muted mt-0.5">Layer 1 — Real-time social media intelligence for Bank Negara Indonesia (BNI)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-lens-text-muted">Period: 01-07 Apr 2026</span>
          <button onClick={handleExport} disabled={exporting} className="btn-secondary text-xs py-1.5">
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard
          label="Total Mentions"
          value={kpis.totalMentions}
          delta={12.4}
          deltaLabel="vs last week"
          icon={<MessageSquare size={16} />}
        />
        <KPICard
          label="Positive %"
          value={kpis.positivePercent}
          format="percent"
          delta={3.1}
          deltaLabel="vs last week"
          icon={<TrendingUp size={16} />}
          accentColor="#22c55e"
        />
        <KPICard
          label="NSS Score"
          value={kpis.nssScore}
          format="score"
          delta={2.8}
          deltaLabel="vs last week"
          icon={<Target size={16} />}
          accentColor="#14b8a6"
        />
        <KPICard
          label="Total Reach"
          value={kpis.totalReach}
          format="reach"
          delta={18.2}
          deltaLabel="vs last week"
          icon={<Eye size={16} />}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <VolumeTrend data={volTrend} />
        </div>
        <SentimentDonut data={sentData} />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-2 gap-3">
        <TopicsBar data={topics} />
        <WordCloud data={words} />
      </div>

      {/* Mention Feed */}
      <MentionFeed data={mentionsList} />
    </div>
  );
}
