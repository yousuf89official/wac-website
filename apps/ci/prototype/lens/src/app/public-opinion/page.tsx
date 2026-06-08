'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';
import GeoMap from '@/components/charts/GeoMap';
import StakeholderTable from '@/components/panels/StakeholderTable';
import IssueTaxonomy from '@/components/panels/IssueTaxonomy';
import {
  provinceData as mockProvinceData,
  stakeholders as mockStakeholders,
  issueTaxonomy as mockIssueTaxonomy,
} from '@/lib/mock/data';
import type { ProvinceData, Stakeholder, IssueTaxonomyNode } from '@/types';

function PolicyHeader() {
  const [exporting, setExporting] = useState(false);

  return (
    <div className="card p-4 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-display font-bold text-white">Kebijakan Subsidi Kendaraan Listrik 2026</h2>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
            <AlertTriangle size={10} /> Medium Risk
          </span>
        </div>
        <p className="text-xs text-lens-text-muted mt-1">Policy monitoring period: Jan - Apr 2026 · 34 provinces tracked</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => { setExporting(true); setTimeout(() => setExporting(false), 1800); }}
          disabled={exporting}
          className="btn-secondary text-xs py-1.5 disabled:opacity-70"
        >
          {exporting ? 'Exporting...' : 'Export Data'}
        </button>
      </div>
    </div>
  );
}

function PublicSentimentSummary() {
  const positive = 48;
  const neutral = 32;
  const negative = 20;

  return (
    <div className="card p-4">
      <h3 className="text-sm font-display font-semibold text-lens-text mb-3">Public Sentiment Summary</h3>
      <div className="flex h-5 rounded-full overflow-hidden bg-slate-800">
        <div
          className="bg-green-400 h-full flex items-center justify-center text-[10px] font-bold text-green-900 transition-all"
          style={{ width: `${positive}%` }}
        >
          {positive}%
        </div>
        <div
          className="bg-slate-400 h-full flex items-center justify-center text-[10px] font-bold text-slate-800 transition-all"
          style={{ width: `${neutral}%` }}
        >
          {neutral}%
        </div>
        <div
          className="bg-red-400 h-full flex items-center justify-center text-[10px] font-bold text-red-900 transition-all"
          style={{ width: `${negative}%` }}
        >
          {negative}%
        </div>
      </div>
      <div className="flex justify-between mt-2 text-[10px]">
        <span className="text-green-400">Positive ({positive}%)</span>
        <span className="text-slate-400">Neutral ({neutral}%)</span>
        <span className="text-red-400">Negative ({negative}%)</span>
      </div>
      <div className="mt-3 p-2 rounded-lg bg-lens-bg/50 border border-lens-border">
        <p className="text-xs text-lens-text-secondary">
          Mayoritas publik <span className="text-green-400 font-medium">mendukung</span> kebijakan subsidi EV, terutama di wilayah Jawa dan Bali.
          Sentimen negatif terkonsentrasi di daerah dengan infrastruktur charging terbatas (Sulawesi, Papua, NTT).
        </p>
      </div>
    </div>
  );
}

function StrategicBrief() {
  const [generating, setGenerating] = useState(false);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-lens-accent" />
        <h3 className="text-sm font-display font-semibold text-lens-text">Strategic Brief</h3>
      </div>
      <div className="p-3 rounded-lg bg-lens-bg/50 border border-lens-border mb-3">
        <div className="space-y-2 text-xs text-lens-text-secondary">
          <div>
            <span className="text-lens-text font-semibold">Key Finding:</span> Kebijakan subsidi EV 2026 mendapat respon positif secara nasional (NSS +48), namun kesenjangan infrastruktur charging di luar Jawa menjadi concern utama.
          </div>
          <div>
            <span className="text-lens-text font-semibold">Risk Assessment:</span> Potensi backlash dari daerah non-Jawa jika alokasi SPKLU tidak merata. DPR Komisi VII mulai mempertanyakan proporsi subsidi untuk brand Cina.
          </div>
          <div>
            <span className="text-lens-text font-semibold">Recommendation:</span> (1) Amplify narasi investasi pabrik lokal & job creation, (2) Engage stakeholder di Sumatera & Kalimantan, (3) Prepare talking points tentang TKDN compliance.
          </div>
        </div>
      </div>
      <button
        onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2000); }}
        className="btn-primary text-xs w-full flex items-center justify-center gap-2"
      >
        <Sparkles size={14} />
        {generating ? 'Generating Full Brief...' : 'Generate Full Strategic Brief'}
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-lens-card rounded w-1/3" />
      <div className="card h-16" />
      <div className="card h-24" />
      <div className="card h-96" />
    </div>
  );
}

export default function PublicOpinionPage() {
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState<ProvinceData[]>(mockProvinceData);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(mockStakeholders);
  const [taxonomy, setTaxonomy] = useState<IssueTaxonomyNode[]>(mockIssueTaxonomy);

  useEffect(() => {
    fetch('/api/public-opinion')
      .then((r) => r.json())
      .then((res) => {
        setProvinces(res.data.provinceData || mockProvinceData);
        setStakeholders(res.data.stakeholders || mockStakeholders);
        setTaxonomy(res.data.issueTaxonomy || mockIssueTaxonomy);
      })
      .catch(() => {
        // Keep mock data
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-lg font-display font-bold text-white">Public Opinion Intelligence</h1>
        <p className="text-xs text-lens-text-muted mt-0.5">Layer 6 — Policy monitoring, geographic sentiment, and stakeholder analysis</p>
      </div>

      <PolicyHeader />
      <PublicSentimentSummary />
      <GeoMap data={provinces} />

      <div className="grid grid-cols-2 gap-3">
        <StakeholderTable data={stakeholders} />
        <div className="space-y-3">
          <IssueTaxonomy data={taxonomy} />
          <StrategicBrief />
        </div>
      </div>
    </div>
  );
}
