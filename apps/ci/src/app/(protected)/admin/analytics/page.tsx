'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    BarChart3, Eye, MousePointer, Clock, Users, TrendingUp, MapPin,
    Smartphone, Globe, ArrowUpRight, ArrowDownRight, RefreshCw, Loader2,
    Monitor, Tablet, Zap, FileText, Download, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(30);
    const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'sources' | 'devices' | 'geo' | 'sessions' | 'events'>('overview');

    // Data states
    const [kpis, setKpis] = useState<any>(null);
    const [trafficChart, setTrafficChart] = useState<any[]>([]);
    const [topPages, setTopPages] = useState<any[]>([]);
    const [sources, setSources] = useState<any>(null);
    const [devices, setDevices] = useState<any>(null);
    const [bounce, setBounce] = useState<any>(null);
    const [geo, setGeo] = useState<any>(null);
    const [activeSessions, setActiveSessions] = useState<any>(null);
    const [visitors, setVisitors] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);

    const range = {
        from: new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Import server actions dynamically
            const { getKpiStats, getTrafficChart, getTopPages, getTrafficSources,
                    getDeviceBreakdown, getBounceEngagement, getGeographicData,
                    getActiveSessions, getVisitorIntelligence, getEventExplorer,
                    getSessionDetails } = await import('@/app/actions/dashboard-analytics');

            const r = range;
            const [kpi, chart, pages, src, dev, bnc, geography, active, vis, evt, sess] = await Promise.allSettled([
                getKpiStats(r), getTrafficChart('daily', r), getTopPages(10, r),
                getTrafficSources(r), getDeviceBreakdown(r), getBounceEngagement(r),
                getGeographicData(r), getActiveSessions(), getVisitorIntelligence(r),
                getEventExplorer(r), getSessionDetails(r, 20),
            ]);

            if (kpi.status === 'fulfilled') setKpis(kpi.value);
            if (chart.status === 'fulfilled') setTrafficChart(chart.value);
            if (pages.status === 'fulfilled') setTopPages(pages.value);
            if (src.status === 'fulfilled') setSources(src.value);
            if (dev.status === 'fulfilled') setDevices(dev.value);
            if (bnc.status === 'fulfilled') setBounce(bnc.value);
            if (geography.status === 'fulfilled') setGeo(geography.value);
            if (active.status === 'fulfilled') setActiveSessions(active.value);
            if (vis.status === 'fulfilled') setVisitors(vis.value);
            if (evt.status === 'fulfilled') setEvents(evt.value);
            if (sess.status === 'fulfilled') setSessions(sess.value);
        } catch (err) {
            console.error('Analytics fetch error:', err);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const StatCard = ({ label, value, change, icon: Icon }: { label: string; value: string | number; change?: number; icon: any }) => (
        <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-2">
                <Icon className="h-4 w-4 text-foreground-soft" />
                {change !== undefined && change !== 0 && (
                    <span className={`text-[10px] font-bold flex items-center gap-0.5 ${change > 0 ? 'text-success' : 'text-destructive'}`}>
                        {change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {change > 0 ? '+' : ''}{change}%
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-foreground">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            <p className="text-[10px] text-foreground-soft mt-1">{label}</p>
        </div>
    );

    if (loading && !kpis) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-xs text-foreground-soft">Loading website analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · Analytics
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    Website Analytics
                </h1>
                <p className="mt-4 text-foreground-soft max-w-2xl">
                    Real-time website traffic, visitor behavior, and engagement metrics.
                </p>
                <div className="mt-6 flex items-center gap-2">
                    {[7, 14, 30, 90].map(d => (
                        <button key={d} onClick={() => setPeriod(d)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${period === d ? 'bg-primary text-foreground shadow-lg shadow-primary/20' : 'bg-card text-foreground-soft border border-border'}`}>
                            {d}d
                        </button>
                    ))}
                    <button onClick={fetchData} className="p-2 rounded-lg hover:bg-card text-foreground-soft hover:text-foreground transition-colors ml-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </header>

            {/* Live Sessions Badge */}
            {activeSessions && activeSessions.count > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
                    </span>
                    <span className="text-sm font-bold text-success">{activeSessions.count} active visitor{activeSessions.count !== 1 ? 's' : ''} right now</span>
                </div>
            )}

            {/* KPI Cards */}
            {kpis && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard label="Page Views" value={kpis.pageViews} change={kpis.pageViewsChange} icon={Eye} />
                    <StatCard label="Sessions" value={kpis.sessions} change={kpis.sessionsChange} icon={BarChart3} />
                    <StatCard label="Unique Visitors" value={kpis.uniqueVisitors} change={kpis.uniqueVisitorsChange} icon={Users} />
                    <StatCard label="Pages/Session" value={kpis.avgPagesPerSession} icon={FileText} />
                    <StatCard label="Bounce Rate" value={bounce ? `${bounce.bounceRate}%` : '—'} icon={ArrowDownRight} />
                    <StatCard label="Avg Duration" value={bounce ? `${Math.floor(bounce.avgDuration / 60)}m ${bounce.avgDuration % 60}s` : '—'} icon={Clock} />
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-border">
                {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'pages', label: 'Top Pages' },
                    { id: 'sources', label: 'Traffic Sources' },
                    { id: 'devices', label: 'Devices' },
                    { id: 'geo', label: 'Geography' },
                    { id: 'sessions', label: 'Sessions' },
                    { id: 'events', label: 'Events' },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-foreground-soft hover:text-foreground-soft'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Traffic Chart */}
                    <div className="p-6 rounded-2xl border border-border bg-card">
                        <h3 className="font-bold text-foreground mb-4">Daily Page Views</h3>
                        <div className="space-y-1">
                            {trafficChart.slice(-14).map((d: any) => {
                                const max = Math.max(...trafficChart.map((t: any) => t.views), 1);
                                return (
                                    <div key={d.date} className="flex items-center gap-3">
                                        <span className="text-[10px] text-foreground-soft w-16 shrink-0">{d.date.split('-').slice(1).join('/')}</span>
                                        <div className="flex-1 h-5 bg-card rounded overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-primary to-accent rounded" style={{ width: `${(d.views / max) * 100}%` }} />
                                        </div>
                                        <span className="text-xs font-bold text-foreground w-12 text-right">{d.views}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Visitor Intelligence */}
                    {visitors && (
                        <div className="p-6 rounded-2xl border border-border bg-card">
                            <h3 className="font-bold text-foreground mb-4">Visitor Intelligence</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg bg-card border border-border">
                                    <p className="text-[10px] text-foreground-soft">New Visitors</p>
                                    <p className="text-xl font-bold text-foreground">{visitors.newVisitors}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-card border border-border">
                                    <p className="text-[10px] text-foreground-soft">Returning</p>
                                    <p className="text-xl font-bold text-primary">{visitors.returningVisitors}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-card border border-border col-span-2">
                                    <p className="text-[10px] text-foreground-soft">Return Rate</p>
                                    <p className="text-xl font-bold text-foreground">{visitors.returnRate}%</p>
                                    <div className="mt-2 h-2 bg-card rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${visitors.returnRate}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Top Pages Tab */}
            {activeTab === 'pages' && (
                <div className="p-6 rounded-2xl border border-border bg-card">
                    <h3 className="font-bold text-foreground mb-4">Top Pages by Views</h3>
                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] text-foreground-soft uppercase tracking-wider border-b border-border">
                                <th className="text-left py-3 px-4">#</th>
                                <th className="text-left py-3 px-4">Page</th>
                                <th className="text-right py-3 px-4">Views</th>
                                <th className="text-right py-3 px-4">Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topPages.map((p: any, i: number) => {
                                const total = topPages.reduce((s: number, t: any) => s + t.views, 0);
                                const pct = total > 0 ? ((p.views / total) * 100).toFixed(1) : '0';
                                return (
                                    <tr key={p.path} className="border-b border-border hover:bg-card">
                                        <td className="py-3 px-4 text-xs text-foreground-soft">{i + 1}</td>
                                        <td className="py-3 px-4 text-sm font-medium text-foreground font-mono">{p.path}</td>
                                        <td className="py-3 px-4 text-sm font-bold text-foreground text-right">{p.views.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-xs text-foreground-soft text-right">{pct}%</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {topPages.length === 0 && <p className="text-center text-sm text-foreground-soft py-8">No page view data yet</p>}
                </div>
            )}

            {/* Traffic Sources Tab */}
            {activeTab === 'sources' && sources && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border border-border bg-card">
                        <h3 className="font-bold text-foreground mb-4">UTM Sources</h3>
                        <div className="space-y-2">
                            {sources.utmSources.length > 0 ? sources.utmSources.map((s: any) => (
                                <div key={s.source} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                                    <span className="text-xs text-foreground-soft">{s.source}</span>
                                    <span className="text-sm font-bold text-foreground">{s.count}</span>
                                </div>
                            )) : <p className="text-sm text-foreground-soft text-center py-4">No UTM data yet</p>}
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl border border-border bg-card">
                        <h3 className="font-bold text-foreground mb-4">Referrers</h3>
                        <div className="space-y-2">
                            {sources.referrers.length > 0 ? sources.referrers.map((r: any) => (
                                <div key={r.referrer} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                                    <span className="text-xs text-foreground-soft truncate max-w-[200px]">{r.referrer}</span>
                                    <span className="text-sm font-bold text-foreground">{r.count}</span>
                                </div>
                            )) : <p className="text-sm text-foreground-soft text-center py-4">No referrer data yet</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Devices Tab */}
            {activeTab === 'devices' && devices && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Device Type', data: devices.devices, icon: Smartphone, keyName: 'type' },
                        { title: 'Browser', data: devices.browsers, icon: Globe, keyName: 'name' },
                        { title: 'Operating System', data: devices.os, icon: Monitor, keyName: 'name' },
                    ].map(section => (
                        <div key={section.title} className="p-6 rounded-2xl border border-border bg-card">
                            <div className="flex items-center gap-2 mb-4">
                                <section.icon className="h-4 w-4 text-primary" />
                                <h3 className="font-bold text-foreground text-sm">{section.title}</h3>
                            </div>
                            <div className="space-y-2">
                                {section.data.length > 0 ? section.data.map((d: any) => {
                                    const total = section.data.reduce((s: number, t: any) => s + t.count, 0);
                                    const pct = total > 0 ? ((d.count / total) * 100).toFixed(1) : '0';
                                    return (
                                        <div key={d[section.keyName]} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-foreground-soft capitalize">{d[section.keyName] || 'Unknown'}</span>
                                                <span className="text-foreground font-bold">{d.count} ({pct}%)</span>
                                            </div>
                                            <div className="h-1.5 bg-card rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                }) : <p className="text-sm text-foreground-soft text-center py-4">No device data yet</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Geography Tab */}
            {activeTab === 'geo' && geo && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border border-border bg-card">
                        <h3 className="font-bold text-foreground mb-4">Countries</h3>
                        <div className="space-y-2">
                            {geo.countries.length > 0 ? geo.countries.map((c: any, i: number) => (
                                <div key={c.name} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                                    <span className="text-xs text-foreground-soft w-5">{i + 1}</span>
                                    <span className="text-xs text-foreground-soft flex-1">{c.name}</span>
                                    <span className="text-sm font-bold text-foreground">{c.count}</span>
                                </div>
                            )) : <p className="text-sm text-foreground-soft text-center py-4">No geographic data yet</p>}
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl border border-border bg-card">
                        <h3 className="font-bold text-foreground mb-4">Cities</h3>
                        <div className="space-y-2">
                            {geo.cities.length > 0 ? geo.cities.map((c: any, i: number) => (
                                <div key={c.name} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                                    <span className="text-xs text-foreground-soft w-5">{i + 1}</span>
                                    <span className="text-xs text-foreground-soft flex-1">{c.name}</span>
                                    <span className="text-sm font-bold text-foreground">{c.count}</span>
                                </div>
                            )) : <p className="text-sm text-foreground-soft text-center py-4">No city data yet</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
                <div className="p-6 rounded-2xl border border-border bg-card overflow-x-auto">
                    <h3 className="font-bold text-foreground mb-4">Recent Sessions</h3>
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="text-[10px] text-foreground-soft uppercase tracking-wider border-b border-border">
                                <th className="text-left py-3 px-3">Device</th>
                                <th className="text-left py-3 px-3">Browser / OS</th>
                                <th className="text-left py-3 px-3">Location</th>
                                <th className="text-left py-3 px-3">Landing Page</th>
                                <th className="text-center py-3 px-3">Pages</th>
                                <th className="text-center py-3 px-3">Duration</th>
                                <th className="text-center py-3 px-3">Bounce</th>
                                <th className="text-left py-3 px-3">Source</th>
                                <th className="text-left py-3 px-3">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.length > 0 ? sessions.map((s: any) => (
                                <tr key={s.sessionId} className="border-b border-border hover:bg-card">
                                    <td className="py-2 px-3 text-xs text-foreground-soft capitalize">{s.deviceType || '—'}</td>
                                    <td className="py-2 px-3 text-xs text-foreground-soft">{s.browser} / {s.os}</td>
                                    <td className="py-2 px-3 text-xs text-foreground-soft">{[s.city, s.country].filter(Boolean).join(', ') || '—'}</td>
                                    <td className="py-2 px-3 text-xs text-foreground-soft font-mono truncate max-w-[150px]">{s.landingPage || '/'}</td>
                                    <td className="py-2 px-3 text-xs text-foreground font-bold text-center">{s.pageCount}</td>
                                    <td className="py-2 px-3 text-xs text-foreground-soft text-center">{s.totalDuration}s</td>
                                    <td className="py-2 px-3 text-center">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${s.isBounce ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                                            {s.isBounce ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="py-2 px-3 text-xs text-foreground-soft">{s.utmSource || 'Direct'}</td>
                                    <td className="py-2 px-3 text-[10px] text-foreground-soft">{new Date(s.entryTime).toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={9} className="text-center text-sm text-foreground-soft py-8">No session data yet. Start tracking to see results.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
                <div className="p-6 rounded-2xl border border-border bg-card">
                    <h3 className="font-bold text-foreground mb-4">Tracked Events</h3>
                    <div className="space-y-2">
                        {events.length > 0 ? events.map((e: any) => (
                            <div key={`${e.name}-${e.category}`} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                                <div className="flex items-center gap-3">
                                    <Zap className="h-3.5 w-3.5 text-primary" />
                                    <div>
                                        <p className="text-xs font-bold text-foreground">{e.name}</p>
                                        <p className="text-[10px] text-foreground-soft">{e.category}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-foreground">{e.count}</span>
                            </div>
                        )) : <p className="text-sm text-foreground-soft text-center py-8">No events tracked yet. Use track() in your components to start recording events.</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
