'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity, Search, Download, User, Settings, Database, Globe, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ActivityEvent {
    id: string;
    userId: string | null;
    userName: string;
    userEmail: string;
    action: string;
    target: string;
    detail: string;
    severity: string;
    ip: string | null;
    createdAt: string;
}

function getSeverityColor(severity: string) {
    switch (severity) {
        case 'critical': return 'text-destructive bg-destructive/10';
        case 'warning': return 'text-warning bg-warning/10';
        default: return 'text-foreground-soft bg-card';
    }
}

function getActionIcon(action: string) {
    switch (action) {
        case 'login': case 'login_failed': return User;
        case 'update': return Settings;
        case 'create': return Database;
        case 'export': return Download;
        case 'sync': case 'backup': return Database;
        case 'view': return Globe;
        default: return Activity;
    }
}

export default function ActivityLogsPage() {
    const [activeTab, setActiveTab] = useState<'events' | 'live'>('events');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [events, setEvents] = useState<ActivityEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterSeverity !== 'all') params.set('severity', filterSeverity);
            if (searchQuery) params.set('search', searchQuery);
            params.set('limit', '100');

            const res = await fetch(`/api/activity-logs?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            } else {
                toast.error('Failed to load activity logs');
            }
        } catch {
            toast.error('Failed to load activity logs');
        } finally {
            setLoading(false);
        }
    }, [filterSeverity, searchQuery]);

    // Fetch users for live sessions (users active in last 30 minutes)
    const fetchOnlineUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/activity-logs?limit=20');
            if (res.ok) {
                const data: ActivityEvent[] = await res.json();
                // Derive "live" users from recent login events (last 30 min)
                const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
                const recentLogins = data.filter(
                    e => e.action === 'login' && new Date(e.createdAt) > thirtyMinAgo
                );
                const uniqueUsers = new Map<string, ActivityEvent>();
                for (const e of recentLogins) {
                    if (!uniqueUsers.has(e.userEmail)) uniqueUsers.set(e.userEmail, e);
                }
                setOnlineUsers(Array.from(uniqueUsers.values()));
            }
        } catch {}
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);
    useEffect(() => { if (activeTab === 'live') fetchOnlineUsers(); }, [activeTab, fetchOnlineUsers]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · Activity Logs
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    Activity Logs & Live Tracking
                </h1>
                <p className="mt-4 text-foreground-soft max-w-2xl">
                    Monitor all user actions, security events, and live sessions in real-time.
                </p>
                <div className="mt-6">
                    <button
                        onClick={fetchLogs}
                        className="flex items-center gap-2 px-4 py-2 border border-border bg-card text-foreground-soft rounded-xl font-bold text-xs hover:bg-card hover:text-foreground transition-all"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> REFRESH
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
                {[{ id: 'events', label: 'Event Log' }, { id: 'live', label: 'Live Sessions' }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-foreground-soft hover:text-foreground'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'events' && (
                <>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-soft" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search events..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs placeholder:text-foreground-soft focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div className="flex gap-1 overflow-x-auto">
                            {['all', 'info', 'warning', 'critical'].map(s => (
                                <button key={s} onClick={() => setFilterSeverity(s)} className={`px-3 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition-all ${filterSeverity === s ? 'bg-primary text-foreground shadow-lg shadow-primary/20' : 'bg-card text-foreground-soft hover:text-foreground border border-border'}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Events */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-6 w-6 animate-spin text-foreground-soft" />
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-20">
                            <Activity className="h-12 w-12 text-foreground-soft mx-auto mb-3" />
                            <p className="text-sm text-foreground-soft">No activity logs found</p>
                            <p className="text-xs text-foreground-soft mt-1">User actions will appear here as they occur</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {events.map(e => {
                                const Icon = getActionIcon(e.action);
                                return (
                                    <div key={e.id} className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-card transition-all">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${getSeverityColor(e.severity)}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-foreground">{e.userName}</span>
                                                <span className="text-[10px] text-foreground-soft">·</span>
                                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-lg ${getSeverityColor(e.severity)}`}>{e.action}</span>
                                                <span className="text-[10px] text-foreground-soft hidden sm:inline">·</span>
                                                <span className="text-[10px] text-foreground-soft hidden sm:inline">{e.target}</span>
                                            </div>
                                            <p className="text-xs text-foreground-soft leading-relaxed">{e.detail}</p>
                                        </div>
                                        <div className="text-left sm:text-right shrink-0 flex sm:block items-center gap-3 sm:gap-0">
                                            <p className="text-[10px] text-foreground-soft">{new Date(e.createdAt).toLocaleString()}</p>
                                            <p className="text-[10px] text-foreground-soft font-mono">{e.ip || 'system'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'live' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-success/5 border border-success/10">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
                        </span>
                        <span className="text-sm font-bold text-success">{onlineUsers.length} active session{onlineUsers.length !== 1 ? 's' : ''} (last 30 min)</span>
                    </div>
                    {onlineUsers.length === 0 ? (
                        <div className="text-center py-16">
                            <User className="h-12 w-12 text-foreground-soft mx-auto mb-3" />
                            <p className="text-sm text-foreground-soft">No active sessions</p>
                            <p className="text-xs text-foreground-soft mt-1">Sessions appear when users log in</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {onlineUsers.map(s => (
                                <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl border border-border bg-card">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-foreground text-xs font-bold shrink-0">
                                        {s.userName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">{s.userName}</p>
                                        <p className="text-[10px] text-foreground-soft">{s.userEmail}</p>
                                    </div>
                                    <div className="sm:text-right">
                                        <p className="text-xs text-foreground-soft">Logged in</p>
                                        <p className="text-[10px] text-foreground-soft">{new Date(s.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
