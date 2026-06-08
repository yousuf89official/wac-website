'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Rocket, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Slide Data ──────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: 'title',
    type: 'title' as const,
    badge: 'Competitive Landscape Analysis - 2026',
    title: 'KlugKlug & Influencer Marketing Platforms',
    tags: [
      { label: 'AI-Powered Discovery', color: '#e63950' },
      { label: '300M+ Influencers', color: '#ff7a4d' },
      { label: '28+ Countries', color: '#ffd166' },
      { label: 'SEA Market Focus', color: '#22c55e' },
    ],
  },
  {
    id: 'agenda',
    type: 'grid' as const,
    label: 'Contents',
    title: 'What This Deck Covers',
    items: [
      { icon: '\u{1F3AF}', title: 'KlugKlug Platform', desc: 'Features, positioning & key differentiators', color: '#e63950' },
      { icon: '\u2694\uFE0F', title: '8 Competitor Platforms', desc: 'HypeAuditor, Modash, GRIN, CreatorIQ & more', color: '#ff7a4d' },
      { icon: '\u{1F4CA}', title: 'Feature Comparison', desc: 'Head-to-head matrix across key capabilities', color: '#ffd166' },
      { icon: '\u{1F30F}', title: 'SEA Market Insight', desc: 'Indonesia & Southeast Asia regional context', color: '#22c55e' },
      { icon: '\u{1F4B0}', title: 'Pricing Overview', desc: 'Plans from $199/mo to $100K+/year', color: '#63b3ed' },
      { icon: '\u2713\uFE0F', title: 'Selection Framework', desc: 'Which platform fits which use case', color: '#a78bfa' },
    ],
  },
  {
    id: 'klugklug',
    type: 'spotlight' as const,
    label: 'Platform Spotlight',
    title: 'KlugKlug: Precision Made Easy',
    subtitle: 'Delhi-based B2B SaaS \u00B7 Founded by IIT/IIM alumni \u00B7 Funded 2025 \u00B7 28+ countries',
    stats: [
      { value: '300M+', label: 'Influencer Profiles', color: '#e63950' },
      { value: '150+', label: 'Countries Covered', color: '#ff7a4d' },
      { value: '60%', label: 'Efficiency Gain', color: '#ffd166' },
    ],
    columns: [
      { title: '\u{1F916} AI-Powered Capabilities', items: ['Image & voice/audio recognition search', 'Semantic keyword content indexing', 'Lookalike influencer technology', 'Audience overlap elimination'] },
      { title: '\u{1F4C8} Campaign Intelligence', items: ['Competitor KOL strategy analysis', '40+ audience & influencer metrics', 'Geo-targeting down to city level', 'Full-suite CRM with history mapping'] },
    ],
  },
  {
    id: 'growth',
    type: 'cards' as const,
    label: 'Business Momentum',
    title: 'Growth Strategy & Market Positioning',
    cards: [
      { icon: '\u{1F680}', title: '10x Growth Target', color: '#e63950', desc: 'Strategic funding secured from unicorn founders, ex-CXOs, and leading angels. Active expansion across India, South Asia, SEA, and MENA over 2 years.' },
      { icon: '\u{1F3E2}', title: 'Enterprise Clients', color: '#ff7a4d', desc: 'RP-Sanjiv Goenka Group (FMCG) and GlobalBees are anchor clients, validating enterprise-grade product capability.' },
      { icon: '\u{1F4E1}', title: 'Platform Coverage', color: '#ffd166', desc: 'Instagram, YouTube, and TikTok indexed with content-level AI analysis. 160+ language support making it one of the most multilingual platforms available.' },
      { icon: '\u{1F4A1}', title: 'Core Thesis', color: '#22c55e', desc: 'The bottom 80% of influencers (micro & nano) are severely underutilized and not discoverable on mainstream tools. KlugKlug aims to unlock this segment.' },
    ],
    footer: '\u26A0\uFE0F Pricing: No public pricing listed. Demo-based custom quote approach \u2014 contact sales for pricing details.',
  },
  {
    id: 'comp-1-2',
    type: 'versus' as const,
    label: 'Competitors 01 & 02',
    title: 'HypeAuditor & Modash',
    left: {
      name: 'HypeAuditor', icon: '\u{1F50D}', color: '#63b3ed', tagline: 'Analytics & Fraud Detection Leader',
      desc: '207M+ influencer profiles. Renowned for AI-powered fraud detection and audience quality scoring. Free trial available.',
      features: ['\u2713 Audience authenticity score', '\u2713 Competitor monitoring (PRO+)', '\u2713 Side-by-side benchmarking', '\u2717 No auto Story capture'],
      pricing: [{ plan: 'Starter', price: '$299/mo' }, { plan: 'Pro', price: '$499/mo' }, { plan: 'Enterprise', price: 'Custom' }],
    },
    right: {
      name: 'Modash', icon: '\u26A1', color: '#22c55e', tagline: 'Best Value Mid-Market Platform',
      desc: '350M+ creators \u2014 largest database available. Transparent pricing, Shopify-native, automatic Story tracking without influencer opt-in.',
      features: ['\u2713 AI content search (images, video)', '\u2713 Auto Story + Reel tracking', '\u2713 Native Shopify integration', '\u2713 14-day free trial'],
      pricing: [{ plan: 'Essentials', price: '$199/mo' }, { plan: 'Performance', price: '$499/mo' }, { plan: 'Enterprise', price: '$14,700/yr+' }],
    },
  },
  {
    id: 'comp-3-4',
    type: 'versus' as const,
    label: 'Competitors 03 & 04',
    title: 'GRIN & Upfluence',
    left: {
      name: 'GRIN', icon: '\u{1F6CD}\uFE0F', color: '#ff7a4d', tagline: 'DTC & E-Commerce Creator CRM',
      desc: 'Purpose-built for direct-to-consumer brands. Ties influencer activity directly to sales with native Shopify & automated payment processing.',
      features: ['\u2713 Integrated gifting management', '\u2713 Automated creator payments & 1099', '\u2713 Affiliate attribution + deep links', '\u2713 Month-to-month contracts'],
      pricing: [{ plan: 'Lite (50 creators)', price: '$399/mo' }, { plan: 'Growth (200)', price: '$1,149/mo' }, { plan: 'Complete (400)', price: '$1,799/mo' }],
    },
    right: {
      name: 'Upfluence', icon: '\u{1F310}', color: '#ffd166', tagline: 'All-in-One with E-Commerce Data',
      desc: 'Covers Instagram, YouTube, TikTok, Twitch, X, Facebook & Pinterest with tight Shopify, Amazon & WooCommerce integrations.',
      features: ['\u2713 7-platform social coverage', '\u2713 E-commerce sales attribution', '\u2713 Influencer outreach automation', '\u2713 Cross-channel campaign mgmt'],
      pricing: [{ plan: 'Modular start', price: '~$478/mo' }, { plan: 'Enterprise (annual)', price: '~$2,500/mo' }, { plan: 'Trial', price: 'Demo only' }],
    },
  },
  {
    id: 'comp-5-6',
    type: 'versus' as const,
    label: 'Competitors 05 & 06',
    title: 'CreatorIQ & Traackr',
    left: {
      name: 'CreatorIQ', icon: '\u{1F3E2}', color: '#a78bfa', tagline: 'Fortune 500 Enterprise Platform',
      desc: 'Used by Nestl\u00E9 and Disney. 20M+ influencer profiles with AI natural-language search. Customers activated 70% more campaigns in 2025.',
      features: ['\u2713 AI natural language search', '\u2713 End-to-end campaign management', '\u2713 Enterprise SSO + API', '\u2713 Wide third-party integrations'],
      pricing: [{ plan: 'Entry', price: '~$30K/yr' }, { plan: 'Mid-tier', price: '~$50K/yr' }, { plan: 'Enterprise', price: '$90K\u2013$100K+' }],
    },
    right: {
      name: 'Traackr', icon: '\u{1F4C9}', color: '#63b3ed', tagline: 'ROI & Relationship Management',
      desc: 'Features a proprietary Brand Vitality Score (VIT). Popular among global beauty, wellness & lifestyle brands for long-term influencer relationship management.',
      features: ['\u2713 Brand Vitality Score (VIT)', '\u2713 Competitor influencer intelligence', '\u2713 Boosted content detection', '\u2713 Auto Story collection'],
      pricing: [{ plan: 'Custom quote', price: 'Enterprise annual' }],
    },
  },
  {
    id: 'comp-7-8',
    type: 'versus' as const,
    label: 'Competitors 07 & 08',
    title: 'Aspire & Kolsquare',
    left: {
      name: 'Aspire (AspireIQ)', icon: '\u{1F4EC}', color: '#22c55e', tagline: 'Creator Marketplace Model',
      desc: 'Unique inbound approach: brands post campaigns, creators apply. Streamlines payments, Shopify integration, and content approvals at scale.',
      features: ['\u2713 Creator marketplace (inbound)', '\u2713 Affiliate discount code tracking', '\u2713 Social media listening', '\u2713 Campaign automation workflows'],
      pricing: [{ plan: 'Starting', price: '$2,000/mo' }, { plan: 'Enterprise', price: '$17K+/yr' }, { plan: 'Trial', price: 'No free trial' }],
    },
    right: {
      name: 'Kolsquare', icon: '\u{1F1EA}\u{1F1FA}', color: '#ffd166', tagline: 'Europe-First, Ethics-Led',
      desc: 'Leading platform for European brands with 5M+ KOL profiles across 6 social platforms. Strong ESG compliance and GDPR-first data ethics.',
      features: ['\u2713 AI search (image + speech-to-text)', '\u2713 Competitor benchmark (11 brands)', '\u2713 Audience overlap analysis', '\u2713 6 social platforms covered'],
      pricing: [{ plan: 'Discovery', price: '\u20AC500/mo' }, { plan: 'Campaign', price: '~$18K/yr' }, { plan: 'Enterprise', price: 'Custom' }],
    },
  },
  {
    id: 'comparison',
    type: 'table' as const,
    label: 'Feature Matrix',
    title: 'Head-to-Head Platform Comparison',
    headers: ['Feature', 'KlugKlug', 'HypeAuditor', 'Modash', 'GRIN', 'CreatorIQ', 'Aspire', 'Kolsquare'],
    rows: [
      { feature: 'Database', values: ['300M+', '207M+', '350M+', 'Varies', '~20M', 'Marketplace', '5M+'], highlights: [0, 2] },
      { feature: 'AI Content Search', values: ['\u2713 Image+Voice', '~ Partial', '\u2713', '\u2717', '\u2713', '\u2717', '\u2713'] },
      { feature: 'Audience Overlap', values: ['\u2713', '\u2713', '~ Partial', '\u2717', '\u2713', '\u2717', '\u2713'] },
      { feature: 'Competitor Intel', values: ['\u2713', '~ PRO only', '\u2717', '\u2717', '\u2717', '\u2717', '\u2713'] },
      { feature: 'E-Commerce Native', values: ['\u2717', '\u2717', '\u2713 Shopify', '\u2713 Native', '\u2713', '\u2713', '\u2713'] },
      { feature: 'Creator Payments', values: ['\u2717', '\u2717', '~ Fee', '\u2713', '\u2713', '\u2713', '~ Enterprise'] },
      { feature: 'SEA/MENA Focus', values: ['\u2713 Primary', '~ Partial', 'Global', 'Global', 'Global', 'Global', 'EU-first'] },
      { feature: 'Free Trial', values: ['\u2717', '\u2713 Limited', '\u2713 14 days', '\u2713 30 days', '\u2717', '\u2717', '\u2717'] },
    ],
  },
  {
    id: 'pricing',
    type: 'bars' as const,
    label: 'Pricing Landscape',
    title: 'Platform Pricing Spectrum',
    bars: [
      { name: 'Modash', price: '$199\u2013$499/mo', width: 12, color: '#22c55e' },
      { name: 'HypeAuditor', price: '$299\u2013$499/mo', width: 18, color: '#63b3ed' },
      { name: 'GRIN', price: '$399\u2013$1,799/mo', width: 30, color: '#ff7a4d' },
      { name: 'Kolsquare', price: '\u20AC500+/mo', width: 35, color: '#ffd166' },
      { name: 'Upfluence', price: '$478\u2013$2.5K/mo', width: 46, color: '#ffd166' },
      { name: 'Aspire', price: '$2K/mo+', width: 58, color: '#e63950' },
      { name: 'Traackr', price: 'Custom / High', width: 72, color: '#a78bfa' },
      { name: 'CreatorIQ', price: '$30K\u2013$100K+/yr', width: 100, color: '#a78bfa' },
    ],
    footer: 'KlugKlug: Custom pricing via demo \u2014 not listed publicly',
  },
  {
    id: 'sea-market',
    type: 'spotlight' as const,
    label: 'Regional Context',
    title: 'SEA & Indonesia \u2014 World\'s Hottest Influencer Market',
    subtitle: '',
    stats: [
      { value: '76%', label: 'Indonesians buy via influencers', color: '#22c55e' },
      { value: '$2.1B', label: 'SEA influencer spend 2025', color: '#63b3ed' },
      { value: '1.1M+', label: 'Indonesian influencers', color: '#ffd166' },
    ],
    columns: [
      { title: '\u2713 KlugKlug SEA Advantage', items: ['India\u2013SEA\u2013MENA primary expansion', '160+ language database support', 'Micro/nano focus = Indonesia sweet spot', 'City-level geo-targeting capability'] },
      { title: '\u26A0\uFE0F Industry-Wide Market Gap', items: ['No platform natively integrates TikTok Shop', 'Shopee & Lazada not supported anywhere', '90% of Indonesian buyers use affiliate links', 'Commerce rail gap is an unmet market need'] },
    ],
  },
  {
    id: 'selection',
    type: 'recommendations' as const,
    label: 'Decision Guide',
    title: 'Which Platform For Which Use Case?',
    items: [
      { name: 'KlugKlug', color: '#e63950', desc: 'India/SEA/MENA brands needing micro/nano discovery, competitor KOL intelligence, AI image/voice search, and audience overlap elimination' },
      { name: 'Modash', color: '#22c55e', desc: 'Best value-to-price ratio. Largest database (350M+), transparent pricing from $199/mo, 14-day trial, and Shopify-native e-commerce tracking' },
      { name: 'GRIN', color: '#ff7a4d', desc: 'DTC/e-commerce brands running high-volume creator programs needing integrated gifting, payment processing, and affiliate management' },
      { name: 'HypeAuditor', color: '#63b3ed', desc: 'Brands where fraud detection and audience quality are #1 priority, with competitor monitoring as a dedicated analytics use case' },
      { name: 'CreatorIQ', color: '#a78bfa', desc: 'Fortune 500 enterprises with $30K\u2013$100K+ annual budget, multi-market programs requiring enterprise-grade security and full API access' },
    ],
  },
  {
    id: 'closing',
    type: 'closing' as const,
    title: 'Key Takeaways',
    cards: [
      { icon: '\u{1F3AF}', title: "KlugKlug's Edge", color: '#e63950', desc: 'Micro/nano discovery + AI image/voice search + competitor intelligence = unique combo for SEA/MENA brands' },
      { icon: '\u{1F4B0}', title: 'Best Entry Point', color: '#ff7a4d', desc: 'Modash at $199/mo with 350M+ profiles and 14-day trial offers the best value-to-capability ratio in the market' },
      { icon: '\u{1F30F}', title: 'Indonesia Opportunity', color: '#22c55e', desc: '76% purchase via influencers \u2014 #1 in ASEAN. TikTok Shop/Shopee integration remains an unmet need across ALL platforms' },
    ],
    footer: 'Influencer Marketing Platform Analysis \u00B7 March 2026',
  },
];

// ─── Slide Components ────────────────────────────────────────────────────────

function SlideTitle({ slide }: { slide: typeof SLIDES[0] }) {
  if (slide.type !== 'title') return null;
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4">
      <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#e63950] via-[#ff7a4d] to-[#ffd166] bg-clip-text text-transparent leading-tight">{slide.title}</h1>
      <p className="text-xs text-foreground/40 uppercase tracking-[0.25em]">{slide.badge}</p>
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {slide.tags?.map(t => (
          <span key={t.label} className="px-3 py-1 rounded-full text-[0.68rem] font-semibold uppercase tracking-wide" style={{ background: `${t.color}18`, color: t.color, border: `1px solid ${t.color}44` }}>{t.label}</span>
        ))}
      </div>
    </div>
  );
}

function SlideGrid({ slide }: { slide: any }) {
  return (
    <div>
      <p className="text-[#e63950] text-xs font-bold uppercase tracking-[0.18em] mb-1">{slide.label}</p>
      <h2 className="text-2xl md:text-3xl font-extrabold mb-6">{slide.title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {slide.items?.map((item: any) => (
          <div key={item.title} className="bg-card border border-border rounded-xl p-4" style={{ borderLeftColor: item.color, borderLeftWidth: 3 }}>
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="font-bold text-sm text-foreground">{item.title}</div>
            <div className="text-xs text-foreground/40 mt-1">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideSpotlight({ slide }: { slide: any }) {
  return (
    <div>
      <p className="text-[#e63950] text-xs font-bold uppercase tracking-[0.18em] mb-1">{slide.label}</p>
      <h2 className="text-2xl md:text-3xl font-extrabold mb-1">{slide.title}</h2>
      {slide.subtitle && <p className="text-foreground/40 text-sm mb-5">{slide.subtitle}</p>}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {slide.stats?.map((s: any) => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: `${s.color}12`, border: `1px solid ${s.color}28` }}>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[0.68rem] text-foreground/40 uppercase tracking-wide mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {slide.columns?.map((col: any) => (
          <div key={col.title} className="bg-card border border-border rounded-xl p-4">
            <div className="font-bold text-sm mb-2">{col.title}</div>
            <ul className="text-xs text-foreground/60 space-y-1.5 pl-3">
              {col.items.map((item: string) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideCards({ slide }: { slide: any }) {
  return (
    <div>
      <p className="text-[#e63950] text-xs font-bold uppercase tracking-[0.18em] mb-1">{slide.label}</p>
      <h2 className="text-2xl md:text-3xl font-extrabold mb-5">{slide.title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {slide.cards?.map((c: any) => (
          <div key={c.title} className="bg-card border border-border rounded-xl p-4">
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="font-bold text-sm mb-1" style={{ color: c.color }}>{c.title}</div>
            <p className="text-xs text-foreground/60 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
      {slide.footer && (
        <div className="mt-3 rounded-lg p-3 text-xs text-foreground/60" style={{ background: 'rgba(230,57,80,0.08)', border: '1px solid rgba(230,57,80,0.18)' }}>
          <span className="text-[#e63950] font-bold">{slide.footer}</span>
        </div>
      )}
    </div>
  );
}

function SlideVersus({ slide }: { slide: any }) {
  const renderSide = (s: any) => (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{s.icon}</span>
        <div>
          <div className="font-extrabold text-base" style={{ color: s.color }}>{s.name}</div>
          <div className="text-[0.68rem] text-foreground/40">{s.tagline}</div>
        </div>
      </div>
      <p className="text-xs text-foreground/60 leading-relaxed mb-3">{s.desc}</p>
      <div className="text-[0.68rem] text-foreground/40 uppercase tracking-wide font-semibold mb-1">Key Features</div>
      <div className="text-xs text-foreground/60 space-y-1 mb-3">
        {s.features.map((f: string) => <div key={f}>{f}</div>)}
      </div>
      <div className="border-t border-border pt-3">
        <div className="text-[0.68rem] text-foreground/40 uppercase tracking-wide font-semibold mb-1">Pricing</div>
        {s.pricing.map((p: any) => (
          <div key={p.plan} className="flex justify-between text-xs text-foreground/60 mb-0.5">
            <span>{p.plan}</span>
            <span className="font-bold" style={{ color: s.color }}>{p.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div>
      <p className="text-[#e63950] text-xs font-bold uppercase tracking-[0.18em] mb-1">{slide.label}</p>
      <h2 className="text-2xl md:text-3xl font-extrabold mb-5">{slide.title}</h2>
      <div className="grid grid-cols-2 gap-4">
        {renderSide(slide.left)}
        {renderSide(slide.right)}
      </div>
    </div>
  );
}

function SlideTable({ slide }: { slide: any }) {
  return (
    <div>
      <p className="text-[#e63950] text-xs font-bold uppercase tracking-[0.18em] mb-1">{slide.label}</p>
      <h2 className="text-xl md:text-2xl font-extrabold mb-4">{slide.title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-[0.72rem] border-collapse">
          <thead>
            <tr>
              {slide.headers.map((h: string, i: number) => (
                <th key={h} className={`px-2.5 py-2 font-bold uppercase tracking-wide text-[0.68rem] ${i === 0 ? 'text-left' : 'text-center'}`} style={{ background: 'rgba(230,57,80,0.12)', color: '#e63950', borderBottom: '1px solid rgba(230,57,80,0.2)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slide.rows.map((row: any, ri: number) => (
              <tr key={row.feature} className={ri % 2 === 0 ? 'bg-card' : ''}>
                <td className="px-2.5 py-2 font-semibold text-foreground border-b border-border">{row.feature}</td>
                {row.values.map((v: string, vi: number) => (
                  <td key={vi} className="px-2.5 py-2 text-center text-foreground/60 border-b border-border">
                    <span className={row.highlights?.includes(vi) ? 'font-bold text-[#e63950]' : v.startsWith('\u2713') ? 'text-[#22c55e]' : v.startsWith('\u2717') ? 'text-[#e63950]' : ''}>{v}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SlideBars({ slide }: { slide: any }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimate(true), 100); return () => clearTimeout(t); }, []);
  return (
    <div>
      <p className="text-[#e63950] text-xs font-bold uppercase tracking-[0.18em] mb-1">{slide.label}</p>
      <h2 className="text-2xl md:text-3xl font-extrabold mb-5">{slide.title}</h2>
      <div className="space-y-2.5">
        {slide.bars.map((b: any, i: number) => (
          <div key={b.name} className="flex items-center gap-3">
            <div className="w-24 text-right text-xs font-bold text-foreground shrink-0">{b.name}</div>
            <div className="flex-1 bg-card rounded h-7 overflow-hidden">
              <div className="h-full rounded transition-all duration-700" style={{ width: animate ? `${b.width}%` : '0%', background: `linear-gradient(90deg, ${b.color}, ${b.color}88)`, transitionDelay: `${i * 80}ms` }} />
            </div>
            <div className="w-28 text-xs font-bold shrink-0" style={{ color: b.color }}>{b.price}</div>
          </div>
        ))}
      </div>
      {slide.footer && <p className="text-xs text-foreground/40 italic mt-3">{slide.footer}</p>}
    </div>
  );
}

function SlideRecommendations({ slide }: { slide: any }) {
  return (
    <div>
      <p className="text-[#e63950] text-xs font-bold uppercase tracking-[0.18em] mb-1">{slide.label}</p>
      <h2 className="text-2xl md:text-3xl font-extrabold mb-5">{slide.title}</h2>
      <div className="space-y-2.5">
        {slide.items.map((item: any) => (
          <div key={item.name} className="rounded-lg p-3 flex items-center gap-3" style={{ background: `${item.color}0C`, border: `1px solid ${item.color}22`, borderLeftWidth: 3, borderLeftColor: item.color }}>
            <div className="font-extrabold text-sm min-w-[95px]" style={{ color: item.color }}>{item.name}</div>
            <div className="text-xs text-foreground/60">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideClosing({ slide }: { slide: any }) {
  return (
    <div className="text-center">
      <div className="text-5xl mb-4">{'\u{1F4CA}'}</div>
      <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#e63950] via-[#ff7a4d] to-[#ffd166] bg-clip-text text-transparent mb-6">{slide.title}</h2>
      <div className="grid grid-cols-3 gap-3">
        {slide.cards?.map((c: any) => (
          <div key={c.title} className="bg-card border border-border rounded-xl p-4">
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="font-bold text-sm mb-1" style={{ color: c.color }}>{c.title}</div>
            <p className="text-xs text-foreground/60 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-foreground/30 uppercase tracking-[0.15em] mt-6">{slide.footer}</p>
    </div>
  );
}

// ─── Renderer Map ────────────────────────────────────────────────────────────

function SlideContent({ slide }: { slide: any }) {
  switch (slide.type) {
    case 'title': return <SlideTitle slide={slide} />;
    case 'grid': return <SlideGrid slide={slide} />;
    case 'spotlight': return <SlideSpotlight slide={slide} />;
    case 'cards': return <SlideCards slide={slide} />;
    case 'versus': return <SlideVersus slide={slide} />;
    case 'table': return <SlideTable slide={slide} />;
    case 'bars': return <SlideBars slide={slide} />;
    case 'recommendations': return <SlideRecommendations slide={slide} />;
    case 'closing': return <SlideClosing slide={slide} />;
    default: return null;
  }
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FutureProductsPage() {
  const [current, setCurrent] = useState(0);
  const total = SLIDES.length;
  const deckRef = useRef<HTMLDivElement>(null);

  const go = useCallback((dir: number) => {
    setCurrent(prev => {
      const next = prev + dir;
      if (next < 0) return total - 1;
      if (next >= total) return 0;
      return next;
    });
  }, [total]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go]);

  return (
    <div className="space-y-8">
                  <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · Future Products
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    Future Products
                </h1>
            </header>

      {/* Slide Deck */}
      <div ref={deckRef} className="relative bg-[hsl(var(--background-2))] rounded-2xl border border-border overflow-hidden" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* Ambient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-16 w-[400px] h-[400px] rounded-full bg-[#e63950] opacity-[0.07] blur-[80px]" />
          <div className="absolute -bottom-24 -left-16 w-[300px] h-[300px] rounded-full bg-[#ff7a4d] opacity-[0.05] blur-[80px]" />
        </div>

        {/* Slide */}
        <div className="relative z-10 flex items-center justify-center p-6 md:p-10" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <div className="w-full max-w-[1100px]" key={current}>
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
              <SlideContent slide={SLIDES[current]} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-card px-5 py-2.5 rounded-full border border-border">
          <button onClick={() => go(-1)} className="w-8 h-8 rounded-full bg-card text-[#e63950] flex items-center justify-center hover:bg-[#e63950]/15 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-[#e63950] scale-125' : 'bg-card/10 hover:bg-card/20'}`} />
            ))}
          </div>
          <button onClick={() => go(1)} className="w-8 h-8 rounded-full bg-card text-[#e63950] flex items-center justify-center hover:bg-[#e63950]/15 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs text-foreground/30 ml-1 min-w-[40px] text-center">{current + 1} / {total}</span>
        </div>
      </div>
    </div>
  );
}
