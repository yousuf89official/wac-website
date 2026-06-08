'use server';

import { prisma } from '@/lib/prisma';

export interface DateRange { from: string; to: string; }

function getDateFilter(range?: DateRange) {
    const from = range?.from ? new Date(range.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = range?.to ? new Date(range.to) : new Date();
    return { gte: from, lte: to };
}

function getPrevPeriod(range?: DateRange): DateRange {
    const from = range?.from ? new Date(range.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = range?.to ? new Date(range.to) : new Date();
    const dur = to.getTime() - from.getTime();
    return { from: new Date(from.getTime() - dur).toISOString(), to: from.toISOString() };
}

function pct(cur: number, prev: number): number {
    if (prev === 0) return cur > 0 ? 100 : 0;
    return Math.round(((cur - prev) / prev) * 1000) / 10;
}

// ─── KPI Stats ──────────────────────────────────────────────────────
export async function getKpiStats(range?: DateRange) {
    const dateFilter = getDateFilter(range);
    const prev = getPrevPeriod(range);
    const prevFilter = getDateFilter(prev);

    const [views, sessions, prevViews, prevSessions, uniqueVisitors, prevUniqueVisitors] = await Promise.all([
        prisma.pageView.count({ where: { createdAt: dateFilter } }),
        prisma.sessionDetail.count({ where: { entryTime: dateFilter } }),
        prisma.pageView.count({ where: { createdAt: prevFilter } }),
        prisma.sessionDetail.count({ where: { entryTime: prevFilter } }),
        prisma.sessionDetail.groupBy({ by: ['ip'], where: { entryTime: dateFilter } }).then((r: any[]) => r.length),
        prisma.sessionDetail.groupBy({ by: ['ip'], where: { entryTime: prevFilter } }).then((r: any[]) => r.length),
    ]);

    return {
        pageViews: views, pageViewsChange: pct(views, prevViews),
        sessions, sessionsChange: pct(sessions, prevSessions),
        uniqueVisitors, uniqueVisitorsChange: pct(uniqueVisitors, prevUniqueVisitors),
        avgPagesPerSession: sessions > 0 ? Math.round((views / sessions) * 10) / 10 : 0,
    };
}

// ─── Traffic Chart ──────────────────────────────────────────────────
export async function getTrafficChart(period: 'daily' | 'weekly' | 'monthly' = 'daily', range?: DateRange) {
    const dateFilter = getDateFilter(range);

    const views = await prisma.pageView.findMany({
        where: { createdAt: dateFilter },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
    });

    const map = new Map<string, number>();
    for (const v of views) {
        const d = v.createdAt.toISOString().split('T')[0];
        map.set(d, (map.get(d) || 0) + 1);
    }

    return Array.from(map.entries()).map(([date, count]) => ({ date, views: count }));
}

// ─── Top Pages ──────────────────────────────────────────────────────
export async function getTopPages(limit = 10, range?: DateRange) {
    const dateFilter = getDateFilter(range);

    const pages = await prisma.pageView.groupBy({
        by: ['path'],
        where: { createdAt: dateFilter },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: limit,
    });

    return pages.map((p: any) => ({ path: p.path, views: p._count.id }));
}

// ─── Traffic Sources ────────────────────────────────────────────────
export async function getTrafficSources(range?: DateRange) {
    const dateFilter = getDateFilter(range);

    const [utmSources, referrers] = await Promise.all([
        prisma.sessionDetail.groupBy({
            by: ['utmSource'],
            where: { entryTime: dateFilter, utmSource: { not: null } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10,
        }),
        prisma.sessionDetail.groupBy({
            by: ['referrer'],
            where: { entryTime: dateFilter, referrer: { not: null } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10,
        }),
    ]);

    return {
        utmSources: utmSources.map((s: any) => ({ source: s.utmSource || 'Direct', count: s._count.id })),
        referrers: referrers.map((r: any) => ({ referrer: r.referrer || 'Direct', count: r._count.id })),
    };
}

// ─── Device Breakdown ───────────────────────────────────────────────
export async function getDeviceBreakdown(range?: DateRange) {
    const dateFilter = getDateFilter(range);

    const [devices, browsers, oses] = await Promise.all([
        prisma.sessionDetail.groupBy({ by: ['deviceType'], where: { entryTime: dateFilter }, _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
        prisma.sessionDetail.groupBy({ by: ['browser'], where: { entryTime: dateFilter }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 5 }),
        prisma.sessionDetail.groupBy({ by: ['os'], where: { entryTime: dateFilter }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 5 }),
    ]);

    return {
        devices: devices.map((d: any) => ({ type: d.deviceType || 'Unknown', count: d._count.id })),
        browsers: browsers.map((b: any) => ({ name: b.browser || 'Unknown', count: b._count.id })),
        os: oses.map((o: any) => ({ name: o.os || 'Unknown', count: o._count.id })),
    };
}

// ─── Bounce & Engagement ────────────────────────────────────────────
export async function getBounceEngagement(range?: DateRange) {
    const dateFilter = getDateFilter(range);

    const [total, bounced, durationAgg] = await Promise.all([
        prisma.sessionDetail.count({ where: { entryTime: dateFilter } }),
        prisma.sessionDetail.count({ where: { entryTime: dateFilter, isBounce: true } }),
        prisma.sessionDetail.aggregate({ where: { entryTime: dateFilter }, _avg: { totalDuration: true, pageCount: true } }),
    ]);

    return {
        totalSessions: total,
        bouncedSessions: bounced,
        bounceRate: total > 0 ? Math.round((bounced / total) * 1000) / 10 : 0,
        avgDuration: Math.round(durationAgg._avg.totalDuration || 0),
        avgPages: Math.round((durationAgg._avg.pageCount || 0) * 10) / 10,
    };
}

// ─── Geographic Data ────────────────────────────────────────────────
export async function getGeographicData(range?: DateRange) {
    const dateFilter = getDateFilter(range);

    const [countries, cities] = await Promise.all([
        prisma.sessionDetail.groupBy({ by: ['country'], where: { entryTime: dateFilter, country: { not: null } }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 15 }),
        prisma.sessionDetail.groupBy({ by: ['city'], where: { entryTime: dateFilter, city: { not: null } }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 15 }),
    ]);

    return {
        countries: countries.map((c: any) => ({ name: c.country || 'Unknown', count: c._count.id })),
        cities: cities.map((c: any) => ({ name: c.city || 'Unknown', count: c._count.id })),
    };
}

// ─── Active Sessions (real-time) ────────────────────────────────────
export async function getActiveSessions() {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const sessions = await prisma.sessionDetail.findMany({
        where: { lastActivity: { gte: fiveMinAgo } },
        select: { sessionId: true, landingPage: true, exitPage: true, deviceType: true, country: true, city: true, lastActivity: true, pageCount: true },
        orderBy: { lastActivity: 'desc' },
        take: 50,
    });
    return { count: sessions.length, sessions };
}

// ─── Visitor Intelligence ───────────────────────────────────────────
export async function getVisitorIntelligence(range?: DateRange) {
    const dateFilter = getDateFilter(range);

    const [total, returning, stages] = await Promise.all([
        prisma.siteVisitor.count({ where: { lastSeen: dateFilter } }),
        prisma.siteVisitor.count({ where: { lastSeen: dateFilter, visitCount: { gt: 1 } } }),
        prisma.siteVisitor.groupBy({ by: ['profileStage'], where: { lastSeen: dateFilter }, _count: { id: true } }),
    ]);

    return {
        totalVisitors: total,
        newVisitors: total - returning,
        returningVisitors: returning,
        returnRate: total > 0 ? Math.round((returning / total) * 1000) / 10 : 0,
        stages: stages.map((s: any) => ({ stage: s.profileStage, count: s._count.id })),
    };
}

// ─── Event Explorer ─────────────────────────────────────────────────
export async function getEventExplorer(range?: DateRange) {
    const dateFilter = getDateFilter(range);

    const events = await prisma.analyticsEvent.groupBy({
        by: ['name', 'category'],
        where: { createdAt: dateFilter },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
    });

    return events.map((e: any) => ({ name: e.name, category: e.category || 'general', count: e._count.id }));
}

// ─── Session Explorer ───────────────────────────────────────────────
export async function getSessionDetails(range?: DateRange, limit = 20) {
    const dateFilter = getDateFilter(range);

    return prisma.sessionDetail.findMany({
        where: { entryTime: dateFilter },
        orderBy: { entryTime: 'desc' },
        take: limit,
        select: {
            sessionId: true, deviceType: true, browser: true, os: true,
            country: true, city: true, landingPage: true, exitPage: true,
            pageCount: true, totalDuration: true, isBounce: true,
            utmSource: true, utmMedium: true, utmCampaign: true,
            entryTime: true, lastActivity: true,
        },
    });
}

// ─── Exit Pages ─────────────────────────────────────────────────────
export async function getExitPages(range?: DateRange) {
    const dateFilter = getDateFilter(range);

    const exits = await prisma.sessionDetail.groupBy({
        by: ['exitPage'],
        where: { entryTime: dateFilter, exitPage: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
    });

    return exits.map((e: any) => ({ page: e.exitPage, count: e._count.id }));
}

// ─── Heatmap Data ───────────────────────────────────────────────────
export async function getHeatmapData(path: string, range?: DateRange) {
    const dateFilter = getDateFilter(range);

    const clicks = await prisma.clickEvent.findMany({
        where: { path, createdAt: dateFilter },
        select: { x: true, y: true, elementTag: true, elementText: true, viewportWidth: true, viewportHeight: true },
        take: 5000,
    });

    // Top clicked elements
    const elementMap = new Map<string, number>();
    for (const c of clicks) {
        const key = `${c.elementTag || '?'}:${c.elementText?.slice(0, 30) || ''}`;
        elementMap.set(key, (elementMap.get(key) || 0) + 1);
    }
    const topElements = Array.from(elementMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([el, count]) => {
            const [tag, text] = el.split(':');
            return { tag, text, count };
        });

    return { clicks: clicks.map((c: any) => ({ x: c.x, y: c.y })), totalClicks: clicks.length, topElements };
}

// ─── Scroll Depth ───────────────────────────────────────────────────
export async function getScrollDepthAnalytics(range?: DateRange) {
    const dateFilter = getDateFilter(range);

    const scrollEvents = await prisma.analyticsEvent.groupBy({
        by: ['name'],
        where: { createdAt: dateFilter, name: { startsWith: 'scroll_' } },
        _count: { id: true },
    });

    return scrollEvents.map((e: any) => ({ depth: e.name.replace('scroll_', '') + '%', count: e._count.id }));
}

// ─── Export Data ─────────────────────────────────────────────────────
export async function getExportData(section: string, range?: DateRange) {
    const dateFilter = getDateFilter(range);

    switch (section) {
        case 'sessions':
            return prisma.sessionDetail.findMany({ where: { entryTime: dateFilter }, orderBy: { entryTime: 'desc' }, take: 5000 });
        case 'pages':
            return getTopPages(100, range);
        case 'events':
            return prisma.analyticsEvent.findMany({ where: { createdAt: dateFilter }, orderBy: { createdAt: 'desc' }, take: 5000, select: { name: true, category: true, path: true, createdAt: true, metadata: true } });
        case 'visitors':
            return prisma.siteVisitor.findMany({ where: { lastSeen: dateFilter }, orderBy: { lastSeen: 'desc' }, take: 5000 });
        default:
            return [];
    }
}

// ─── Insight History ────────────────────────────────────────────────
export async function getInsightHistory() {
    return prisma.analyticsInsight.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
}

// ─── Purge Old Data ─────────────────────────────────────────────────
export async function purgeOldData(days: number) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const [pv, ev, cl, be, sd] = await Promise.all([
        prisma.pageView.deleteMany({ where: { createdAt: { lt: cutoff } } }),
        prisma.analyticsEvent.deleteMany({ where: { createdAt: { lt: cutoff } } }),
        prisma.clickEvent.deleteMany({ where: { createdAt: { lt: cutoff } } }),
        prisma.behaviorEvent.deleteMany({ where: { createdAt: { lt: cutoff } } }),
        prisma.sessionDetail.deleteMany({ where: { entryTime: { lt: cutoff } } }),
    ]);
    return { deleted: { pageViews: pv.count, events: ev.count, clicks: cl.count, behaviors: be.count, sessions: sd.count } };
}
