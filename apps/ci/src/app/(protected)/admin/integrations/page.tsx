'use client';

import { useState } from 'react';
import { Plus, RefreshCw, Settings, Unplug } from 'lucide-react';

const AD_PLATFORMS = [
    {
        id: 'google-ads', name: 'Google Ads', icon: 'search', color: '#4285F4', status: 'connected', account: 'IMH Global (123-456-7890)', // brand color — kept
        metrics: ['Impressions', 'Clicks', 'CTR', 'CPC', 'Conversions', 'ROAS', 'Quality Score', 'Impression Share'],
        lastSync: '5 min ago', dataPoints: 45230,
    },
    {
        id: 'meta-ads', name: 'Meta Ads', icon: 'groups', color: '#1877F2', status: 'connected', account: 'IMH Business (act_987654321)', // brand color — kept
        metrics: ['Impressions', 'Reach', 'Frequency', 'Clicks', 'CTR', 'CPM', 'Conversions', 'ROAS', 'Video Views'],
        lastSync: '12 min ago', dataPoints: 38450,
    },
    {
        id: 'tiktok-ads', name: 'TikTok Ads', icon: 'music_note', color: '#000000', status: 'connected', account: 'IMH TikTok Business', // brand color — kept
        metrics: ['Impressions', 'Clicks', 'CTR', 'CPM', 'Conversions', 'Video Views', 'Engagement Rate', 'Profile Visits'],
        lastSync: '30 min ago', dataPoints: 12800,
    },
    {
        id: 'linkedin-ads', name: 'LinkedIn Ads', icon: 'work', color: '#0A66C2', status: 'disconnected', account: null, // brand color — kept
        metrics: ['Impressions', 'Clicks', 'CTR', 'CPC', 'Conversions', 'Leads', 'Social Actions', 'Demographics'],
        lastSync: null, dataPoints: 0,
    },
    {
        id: 'twitter-ads', name: 'X (Twitter) Ads', icon: 'tag', color: '#1DA1F2', status: 'disconnected', account: null, // brand color — kept
        metrics: ['Impressions', 'Engagements', 'Link Clicks', 'Retweets', 'Follows', 'App Installs'],
        lastSync: null, dataPoints: 0,
    },
    {
        id: 'dv360', name: 'Display & Video 360', icon: 'tv', color: '#0F9D58', status: 'disconnected', account: null, // brand color — kept
        metrics: ['Impressions', 'Clicks', 'Viewability', 'CTR', 'CPM', 'Conversions', 'Reach'],
        lastSync: null, dataPoints: 0,
    },
];

const DATA_PLATFORMS = [
    {
        id: 'google-sheets', name: 'Google Sheets', icon: 'table_chart', color: '#0F9D58', status: 'connected', // brand color — kept
        desc: 'Real-time bidirectional data sync with Google Sheets. Extract metrics, push reports, and modify campaign data.',
        sheets: [
            { name: 'Campaign Performance Q1 2026', lastSync: '10 min ago', rows: 1245, direction: 'pull' },
            { name: 'Budget Tracker - March', lastSync: '1 hour ago', rows: 48, direction: 'push' },
            { name: 'Media Plan Template', lastSync: '2 hours ago', rows: 156, direction: 'bidirectional' },
        ],
    },
    {
        id: 'google-analytics', name: 'Google Analytics 4', icon: 'analytics', color: '#E37400', status: 'connected', // brand color — kept
        desc: 'Import GA4 metrics for cross-platform attribution and behavior analysis.',
        sheets: [],
    },
    {
        id: 'bigquery', name: 'Google BigQuery', icon: 'database', color: '#4285F4', status: 'disconnected', // brand color — kept
        desc: 'Export raw data to BigQuery for advanced analysis and custom reporting.',
        sheets: [],
    },
];

export default function IntegrationsPage() {
    const [activeTab, setActiveTab] = useState<'ad-platforms' | 'data' | 'webhooks'>('ad-platforms');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · Integrations
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    Integrations
                </h1>
                <p className="mt-4 text-foreground-soft max-w-2xl">
                    Connect ad platforms, data sources, and productivity tools. Real-time data sync across Google Ads, Meta, TikTok, LinkedIn, Google Sheets, and more.
                </p>
                <div className="mt-6">
                    <button className="flex items-center gap-2 px-6 py-2 bg-primary text-foreground rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" /> ADD INTEGRATION
                    </button>
                </div>
            </header>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Connected Platforms', value: AD_PLATFORMS.filter(p => p.status === 'connected').length + DATA_PLATFORMS.filter(p => p.status === 'connected').length },
                    { label: 'Total Data Points', value: `${(AD_PLATFORMS.reduce((s, p) => s + p.dataPoints, 0) / 1000).toFixed(1)}K` },
                    { label: 'Last Sync', value: '5 min ago' },
                    { label: 'Sync Frequency', value: 'Every 15 min' },
                ].map(s => (
                    <div key={s.label} className="p-5 rounded-xl border border-border bg-card">
                        <p className="text-[10px] text-foreground-soft uppercase tracking-wider mb-1">{s.label}</p>
                        <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 border-b border-border">
                {[{ id: 'ad-platforms', label: 'Ad Platforms' }, { id: 'data', label: 'Data & Sheets' }, { id: 'webhooks', label: 'Webhooks' }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-foreground-soft'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'ad-platforms' && (
                <div className="grid md:grid-cols-2 gap-4">
                    {AD_PLATFORMS.map(p => (
                        <div key={p.id} className={`p-6 rounded-2xl border ${p.status === 'connected' ? 'border-success/10' : 'border-border'} bg-card`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${p.color}15` }}>
                                        <span className="material-symbols-outlined text-lg" style={{ color: p.color }}>{p.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">{p.name}</h3>
                                        {p.account && <p className="text-[10px] text-foreground-soft">{p.account}</p>}
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${p.status === 'connected' ? 'bg-success/10 text-success' : 'bg-card text-foreground-soft'}`}>
                                    {p.status}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-4">
                                {p.metrics.slice(0, 6).map(m => (
                                    <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-card text-foreground-soft">{m}</span>
                                ))}
                                {p.metrics.length > 6 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-card text-foreground-soft">+{p.metrics.length - 6} more</span>}
                            </div>
                            {p.status === 'connected' ? (
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-foreground-soft">Last sync: {p.lastSync} · {p.dataPoints.toLocaleString()} data points</span>
                                    <div className="flex gap-1">
                                        <button className="p-1.5 rounded-lg hover:bg-card text-foreground-soft hover:text-foreground"><RefreshCw className="h-3.5 w-3.5" /></button>
                                        <button className="p-1.5 rounded-lg hover:bg-card text-foreground-soft hover:text-foreground"><Settings className="h-3.5 w-3.5" /></button>
                                        <button className="p-1.5 rounded-lg hover:bg-destructive/10 text-foreground-soft hover:text-destructive"><Unplug className="h-3.5 w-3.5" /></button>
                                    </div>
                                </div>
                            ) : (
                                <button className="w-full py-2.5 bg-primary text-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all">
                                    Connect {p.name}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'data' && (
                <div className="space-y-6">
                    {DATA_PLATFORMS.map(p => (
                        <div key={p.id} className="p-6 rounded-2xl border border-border bg-card">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${p.color}15` }}>
                                        <span className="material-symbols-outlined text-lg" style={{ color: p.color }}>{p.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">{p.name}</h3>
                                        <p className="text-xs text-foreground-soft">{p.desc}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${p.status === 'connected' ? 'bg-success/10 text-success' : 'bg-card text-foreground-soft'}`}>{p.status}</span>
                            </div>
                            {p.id === 'google-sheets' && p.sheets.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <h4 className="text-xs font-bold text-foreground-soft uppercase tracking-wider">Connected Sheets</h4>
                                    {p.sheets.map(s => (
                                        <div key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                                            <div>
                                                <p className="text-sm text-foreground font-medium">{s.name}</p>
                                                <p className="text-[10px] text-foreground-soft">{s.rows} rows · Last sync: {s.lastSync}</p>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.direction === 'pull' ? 'bg-accent/10 text-accent' : s.direction === 'push' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'}`}>
                                                {s.direction}
                                            </span>
                                        </div>
                                    ))}
                                    <button className="w-full py-2 border border-dashed border-border text-foreground-soft rounded-lg text-xs hover:border-primary/30 hover:text-primary transition-all">
                                        + Connect Another Sheet
                                    </button>
                                </div>
                            )}
                            {p.status === 'disconnected' && (
                                <button className="mt-4 w-full py-2.5 bg-primary text-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all">
                                    Connect {p.name}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'webhooks' && (
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card">
                        <h3 className="font-bold text-foreground mb-4">Webhook Endpoints</h3>
                        <div className="space-y-3">
                            {[
                                { url: 'https://hooks.example.com/imh/campaigns', events: ['campaign.created', 'campaign.updated'], status: 'active' },
                                { url: 'https://api.slack.com/webhooks/T0123/B456', events: ['alert.triggered', 'report.generated'], status: 'active' },
                            ].map((wh, idx) => (
                                <div key={idx} className="p-4 rounded-lg bg-card border border-border">
                                    <div className="flex justify-between items-start mb-2">
                                        <code className="text-xs text-foreground-soft font-mono">{wh.url}</code>
                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-success/10 text-success">{wh.status}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {wh.events.map(e => (
                                            <span key={e} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{e}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="mt-4 w-full py-2 border border-dashed border-border text-foreground-soft rounded-lg text-xs hover:border-primary/30 hover:text-primary transition-all">
                            + Add Webhook Endpoint
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
