'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Users, Link2, Globe, FileText, Copy, Plus, Trash2, RefreshCw,
    Loader2, ExternalLink, Lock, Calendar, Mail, ToggleLeft, ToggleRight,
    Eye, Clock, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Brand {
    id: string;
    name: string;
    slug?: string;
}

interface ShareLink {
    id: string;
    token: string;
    brandId: string;
    brand?: Brand;
    brandName?: string;
    linkType?: string;
    passwordProtected?: boolean;
    expiresAt: string | null;
    views?: number;
    createdAt: string;
}

interface WhitelabelDomain {
    id: string;
    domain: string;
    brandName: string;
    logo: string | null;
    primaryColor: string;
    isActive: boolean;
    createdAt: string;
}

interface ScheduledReport {
    id: string;
    brandId: string;
    brand?: Brand;
    recipientEmails: string[];
    frequency: string;
    includeScores: boolean;
    includeAnomalies: boolean;
    includeBenchmarks: boolean;
    isActive: boolean;
    lastSentAt: string | null;
    nextSendAt: string | null;
    createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined) {
    if (!d) return '--';
    return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(d: string | null | undefined) {
    if (!d) return '--';
    return new Date(d).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ClientPortalPage() {
    const [loading, setLoading] = useState(true);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
    const [domains, setDomains] = useState<WhitelabelDomain[]>([]);
    const [reports, setReports] = useState<ScheduledReport[]>([]);

    // Dialog states
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [showDomainDialog, setShowDomainDialog] = useState(false);
    const [showReportDialog, setShowReportDialog] = useState(false);

    // Share link form
    const [shareBrandId, setShareBrandId] = useState('');
    const [shareLinkType, setShareLinkType] = useState('dashboard');
    const [sharePassword, setSharePassword] = useState(false);
    const [shareExpiry, setShareExpiry] = useState('');
    const [shareSubmitting, setShareSubmitting] = useState(false);

    // Domain form
    const [domainName, setDomainName] = useState('');
    const [domainBrand, setDomainBrand] = useState('');
    const [domainLogo, setDomainLogo] = useState('');
    const [domainColor, setDomainColor] = useState('hsl(var(--primary))');
    const [domainSubmitting, setDomainSubmitting] = useState(false);

    // Report form
    const [reportBrandId, setReportBrandId] = useState('');
    const [reportFrequency, setReportFrequency] = useState('weekly');
    const [reportRecipients, setReportRecipients] = useState('');
    const [reportScores, setReportScores] = useState(true);
    const [reportAnomalies, setReportAnomalies] = useState(true);
    const [reportBenchmarks, setReportBenchmarks] = useState(true);
    const [reportSubmitting, setReportSubmitting] = useState(false);

    // ─── Data Fetching ───────────────────────────────────────────────────────

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [brandsRes, whitelabelRes, reportsRes] = await Promise.allSettled([
                fetch('/api/brands'),
                fetch('/api/whitelabel'),
                fetch('/api/scheduled-reports'),
            ]);

            if (brandsRes.status === 'fulfilled' && brandsRes.value.ok) {
                const data = await brandsRes.value.json();
                setBrands(Array.isArray(data) ? data : data.brands || []);
            }

            if (whitelabelRes.status === 'fulfilled' && whitelabelRes.value.ok) {
                setDomains(await whitelabelRes.value.json());
            }

            if (reportsRes.status === 'fulfilled' && reportsRes.value.ok) {
                setReports(await reportsRes.value.json());
            }

            // Share links: the /api/share endpoint is POST-only for creation,
            // so we use mock data for the list display
            setShareLinks([]);
        } catch {
            toast.error('Failed to load portal data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ─── Actions ─────────────────────────────────────────────────────────────

    const createShareLink = async () => {
        if (!shareBrandId) { toast.error('Select a brand'); return; }
        setShareSubmitting(true);
        try {
            const res = await fetch('/api/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brandId: shareBrandId }),
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Failed');
            const data = await res.json();
            const newLink: ShareLink = {
                id: data.token,
                token: data.token,
                brandId: shareBrandId,
                brandName: brands.find(b => b.id === shareBrandId)?.name || 'Unknown',
                linkType: shareLinkType,
                passwordProtected: sharePassword,
                expiresAt: shareExpiry || null,
                views: 0,
                createdAt: new Date().toISOString(),
            };
            setShareLinks(prev => [newLink, ...prev]);
            setShowShareDialog(false);
            resetShareForm();
            toast.success('Share link created');
        } catch (err: any) {
            toast.error(err.message || 'Failed to create share link');
        } finally {
            setShareSubmitting(false);
        }
    };

    const copyShareLink = (token: string) => {
        const url = `${window.location.origin}/share/${token}`;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
    };

    const createDomain = async () => {
        if (!domainName || !domainBrand) { toast.error('Domain and brand name are required'); return; }
        setDomainSubmitting(true);
        try {
            const res = await fetch('/api/whitelabel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: domainName,
                    brandName: domainBrand,
                    logo: domainLogo || undefined,
                    primaryColor: domainColor,
                }),
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Failed');
            const data = await res.json();
            setDomains(prev => [data, ...prev]);
            setShowDomainDialog(false);
            resetDomainForm();
            toast.success('Domain added successfully');
        } catch (err: any) {
            toast.error(err.message || 'Failed to add domain');
        } finally {
            setDomainSubmitting(false);
        }
    };

    const deleteDomain = async (id: string) => {
        try {
            const res = await fetch(`/api/whitelabel/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            setDomains(prev => prev.filter(d => d.id !== id));
            toast.success('Domain deleted');
        } catch {
            toast.error('Failed to delete domain');
        }
    };

    const createReport = async () => {
        if (!reportBrandId || !reportRecipients.trim()) { toast.error('Brand and recipients are required'); return; }
        const emails = reportRecipients.split(',').map(e => e.trim()).filter(Boolean);
        setReportSubmitting(true);
        try {
            const res = await fetch('/api/scheduled-reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brandId: reportBrandId,
                    recipientEmails: emails,
                    frequency: reportFrequency,
                    includeScores: reportScores,
                    includeAnomalies: reportAnomalies,
                    includeBenchmarks: reportBenchmarks,
                }),
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Failed');
            const data = await res.json();
            setReports(prev => [data, ...prev]);
            setShowReportDialog(false);
            resetReportForm();
            toast.success('Report scheduled');
        } catch (err: any) {
            toast.error(err.message || 'Failed to schedule report');
        } finally {
            setReportSubmitting(false);
        }
    };

    const toggleReport = async (id: string, isActive: boolean) => {
        try {
            const res = await fetch(`/api/scheduled-reports/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !isActive }),
            });
            if (!res.ok) throw new Error('Failed');
            setReports(prev => prev.map(r => r.id === id ? { ...r, isActive: !isActive } : r));
            toast.success(`Report ${!isActive ? 'activated' : 'paused'}`);
        } catch {
            toast.error('Failed to toggle report');
        }
    };

    const deleteReport = async (id: string) => {
        try {
            const res = await fetch(`/api/scheduled-reports/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            setReports(prev => prev.filter(r => r.id !== id));
            toast.success('Report deleted');
        } catch {
            toast.error('Failed to delete report');
        }
    };

    // ─── Form Resets ─────────────────────────────────────────────────────────

    const resetShareForm = () => {
        setShareBrandId(''); setShareLinkType('dashboard'); setSharePassword(false); setShareExpiry('');
    };

    const resetDomainForm = () => {
        setDomainName(''); setDomainBrand(''); setDomainLogo(''); setDomainColor('hsl(var(--primary))');
    };

    const resetReportForm = () => {
        setReportBrandId(''); setReportFrequency('weekly'); setReportRecipients('');
        setReportScores(true); setReportAnomalies(true); setReportBenchmarks(true);
    };

    // ─── Stats ───────────────────────────────────────────────────────────────

    const totalRecipients = new Set(reports.flatMap(r => r.recipientEmails || [])).size;

    // ─── Render ──────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · Client Portal
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    Client Portal
                </h1>
                <div className="mt-6"><button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-card/5 border border-border text-foreground rounded-xl font-bold text-xs hover:bg-card/10 transition-all"
                    >
                        <RefreshCw className="h-4 w-4" /> REFRESH
                    </button></div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl border border-border bg-card ">
                    <p className="text-[10px] text-foreground/30 uppercase tracking-wider mb-1">Active Share Links</p>
                    <p className="text-2xl font-bold text-[hsl(var(--primary))]">{shareLinks.length}</p>
                    <p className="text-[10px] text-foreground/40 mt-1">client-facing links</p>
                </div>
                <div className="p-5 rounded-xl border border-border bg-card ">
                    <p className="text-[10px] text-foreground/30 uppercase tracking-wider mb-1">White-Label Domains</p>
                    <p className="text-2xl font-bold text-foreground">{domains.length}</p>
                    <p className="text-[10px] text-foreground/40 mt-1">{domains.filter(d => d.isActive).length} active</p>
                </div>
                <div className="p-5 rounded-xl border border-border bg-card ">
                    <p className="text-[10px] text-foreground/30 uppercase tracking-wider mb-1">Scheduled Reports</p>
                    <p className="text-2xl font-bold text-foreground">{reports.length}</p>
                    <p className="text-[10px] text-foreground/40 mt-1">{reports.filter(r => r.isActive).length} active</p>
                </div>
                <div className="p-5 rounded-xl border border-border bg-card ">
                    <p className="text-[10px] text-foreground/30 uppercase tracking-wider mb-1">Unique Recipients</p>
                    <p className="text-2xl font-bold text-success">{totalRecipients}</p>
                    <p className="text-[10px] text-foreground/40 mt-1">across all reports</p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="share-links" className="space-y-8">
                <TabsList className="bg-card/5 border border-border rounded-xl p-1">
                    <TabsTrigger value="share-links" className="data-[state=active]:bg-[hsl(var(--primary))]/20 data-[state=active]:text-[hsl(var(--primary))] text-foreground/50 rounded-lg text-xs font-bold uppercase tracking-wider px-4 py-2">
                        <Link2 className="h-3.5 w-3.5 mr-2" /> Share Links
                    </TabsTrigger>
                    <TabsTrigger value="whitelabel" className="data-[state=active]:bg-[hsl(var(--primary))]/20 data-[state=active]:text-[hsl(var(--primary))] text-foreground/50 rounded-lg text-xs font-bold uppercase tracking-wider px-4 py-2">
                        <Globe className="h-3.5 w-3.5 mr-2" /> White-Label Domains
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="data-[state=active]:bg-[hsl(var(--primary))]/20 data-[state=active]:text-[hsl(var(--primary))] text-foreground/50 rounded-lg text-xs font-bold uppercase tracking-wider px-4 py-2">
                        <FileText className="h-3.5 w-3.5 mr-2" /> Client Reports
                    </TabsTrigger>
                </TabsList>

                {/* ────────── Tab 1: Share Links ────────── */}
                <TabsContent value="share-links" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-foreground/40">Generate shareable links for client dashboards, reports, and campaigns.</p>
                        <Button
                            onClick={() => setShowShareDialog(true)}
                            className="bg-[hsl(var(--primary))] hover:bg-primary/90 text-foreground text-xs font-bold"
                        >
                            <Plus className="h-4 w-4 mr-1.5" /> Create Share Link
                        </Button>
                    </div>

                    {shareLinks.length === 0 ? (
                        <div className="p-12 rounded-2xl border border-border bg-card text-center">
                            <Link2 className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                            <p className="text-sm text-foreground/40 mb-1">No share links yet</p>
                            <p className="text-xs text-foreground/20">Create a share link to give clients access to dashboards and reports.</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border bg-card overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left text-[10px] text-foreground/30 uppercase tracking-wider px-5 py-3 font-bold">Brand</th>
                                        <th className="text-left text-[10px] text-foreground/30 uppercase tracking-wider px-5 py-3 font-bold">Type</th>
                                        <th className="text-left text-[10px] text-foreground/30 uppercase tracking-wider px-5 py-3 font-bold">Shared</th>
                                        <th className="text-left text-[10px] text-foreground/30 uppercase tracking-wider px-5 py-3 font-bold">Expiry</th>
                                        <th className="text-left text-[10px] text-foreground/30 uppercase tracking-wider px-5 py-3 font-bold">Views</th>
                                        <th className="text-right text-[10px] text-foreground/30 uppercase tracking-wider px-5 py-3 font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shareLinks.map(link => (
                                        <tr key={link.id} className="border-b border-border hover:bg-card transition-colors">
                                            <td className="px-5 py-3">
                                                <span className="text-xs font-bold text-foreground">{link.brandName || link.brand?.name || '--'}</span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <Badge variant="outline" className="text-[10px] border-border text-foreground/60 capitalize">
                                                    {link.linkType || 'dashboard'}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-foreground/40">{formatDate(link.createdAt)}</td>
                                            <td className="px-5 py-3 text-xs text-foreground/40">
                                                {link.expiresAt ? formatDate(link.expiresAt) : <span className="text-foreground/20">No expiry</span>}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="text-xs font-bold text-foreground/60 flex items-center gap-1">
                                                    <Eye className="h-3 w-3" /> {link.views ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {link.passwordProtected && (
                                                        <Lock className="h-3.5 w-3.5 text-warning mr-1" />
                                                    )}
                                                    <button
                                                        onClick={() => copyShareLink(link.token)}
                                                        className="p-1.5 rounded-lg hover:bg-card/10 text-foreground/40 hover:text-[hsl(var(--primary))] transition-colors"
                                                        title="Copy link"
                                                    >
                                                        <Copy className="h-3.5 w-3.5" />
                                                    </button>
                                                    <a
                                                        href={`/share/${link.token}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 rounded-lg hover:bg-card/10 text-foreground/40 hover:text-foreground transition-colors"
                                                        title="Open link"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </TabsContent>

                {/* ────────── Tab 2: White-Label Domains ────────── */}
                <TabsContent value="whitelabel" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-foreground/40">Configure custom domains for branded client portals.</p>
                        <Button
                            onClick={() => setShowDomainDialog(true)}
                            className="bg-[hsl(var(--primary))] hover:bg-primary/90 text-foreground text-xs font-bold"
                        >
                            <Plus className="h-4 w-4 mr-1.5" /> Add Domain
                        </Button>
                    </div>

                    {domains.length === 0 ? (
                        <div className="p-12 rounded-2xl border border-border bg-card text-center">
                            <Globe className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                            <p className="text-sm text-foreground/40 mb-1">No white-label domains</p>
                            <p className="text-xs text-foreground/20">Add a custom domain to create branded client portals.</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border bg-card overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left text-[10px] text-foreground/30 uppercase tracking-wider px-5 py-3 font-bold">Domain</th>
                                        <th className="text-left text-[10px] text-foreground/30 uppercase tracking-wider px-5 py-3 font-bold">Brand</th>
                                        <th className="text-left text-[10px] text-foreground/30 uppercase tracking-wider px-5 py-3 font-bold">Status</th>
                                        <th className="text-left text-[10px] text-foreground/30 uppercase tracking-wider px-5 py-3 font-bold">Created</th>
                                        <th className="text-right text-[10px] text-foreground/30 uppercase tracking-wider px-5 py-3 font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {domains.map(domain => (
                                        <tr key={domain.id} className="border-b border-border hover:bg-card transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: domain.primaryColor || 'hsl(var(--primary))' }} />
                                                    <span className="text-xs font-bold text-foreground">{domain.domain}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-foreground/60">{domain.brandName}</td>
                                            <td className="px-5 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] ${domain.isActive ? 'border-success text-success bg-success' : 'border-warning text-warning bg-warning'}`}
                                                >
                                                    {domain.isActive ? 'Active' : 'Pending'}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-foreground/40">{formatDate(domain.createdAt)}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button
                                                    onClick={() => deleteDomain(domain.id)}
                                                    className="p-1.5 rounded-lg hover:bg-destructive text-foreground/30 hover:text-destructive transition-colors"
                                                    title="Delete domain"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </TabsContent>

                {/* ────────── Tab 3: Client Reports ────────── */}
                <TabsContent value="reports" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-foreground/40">Automated report delivery to clients on a recurring schedule.</p>
                        <Button
                            onClick={() => setShowReportDialog(true)}
                            className="bg-[hsl(var(--primary))] hover:bg-primary/90 text-foreground text-xs font-bold"
                        >
                            <Plus className="h-4 w-4 mr-1.5" /> Schedule Report
                        </Button>
                    </div>

                    {reports.length === 0 ? (
                        <div className="p-12 rounded-2xl border border-border bg-card text-center">
                            <FileText className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                            <p className="text-sm text-foreground/40 mb-1">No scheduled reports</p>
                            <p className="text-xs text-foreground/20">Schedule automated reports to keep clients informed.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reports.map(report => (
                                <div
                                    key={report.id}
                                    className={`p-5 rounded-xl border transition-all ${report.isActive ? 'border-border bg-card' : 'border-border bg-card opacity-60'}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-bold text-foreground">{report.brand?.name || 'Unknown Brand'}</span>
                                                <Badge variant="outline" className="text-[10px] border-border text-foreground/50 capitalize">
                                                    {report.frequency}
                                                </Badge>
                                                {report.isActive ? (
                                                    <Badge variant="outline" className="text-[10px] border-success text-success bg-success">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-[10px] border-border text-foreground/30">Paused</Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-foreground/40">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {Array.isArray(report.recipientEmails)
                                                        ? report.recipientEmails.join(', ')
                                                        : '--'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Send className="h-3 w-3" />
                                                    Last: {formatDateTime(report.lastSentAt)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Next: {formatDateTime(report.nextSendAt)}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                {report.includeScores && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">Scores</span>}
                                                {report.includeAnomalies && <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning text-warning">Anomalies</span>}
                                                {report.includeBenchmarks && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">Benchmarks</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => toggleReport(report.id, report.isActive)}
                                                className={`p-1.5 rounded-lg transition-colors ${report.isActive ? 'hover:bg-warning text-success hover:text-warning' : 'hover:bg-success text-foreground/30 hover:text-success'}`}
                                                title={report.isActive ? 'Pause report' : 'Activate report'}
                                            >
                                                {report.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                                            </button>
                                            <button
                                                onClick={() => deleteReport(report.id)}
                                                className="p-1.5 rounded-lg hover:bg-destructive text-foreground/30 hover:text-destructive transition-colors"
                                                title="Delete report"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* ────────── Dialog: Create Share Link ────────── */}
            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                <DialogContent className="bg-[#0F1629] border border-border text-foreground max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Create Share Link</DialogTitle>
                        <DialogDescription className="text-foreground/40">Generate a shareable link for client access.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="text-foreground/60 text-xs">Brand</Label>
                            <Select value={shareBrandId} onValueChange={setShareBrandId}>
                                <SelectTrigger className="bg-card border-border text-foreground">
                                    <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                                <SelectContent className="bg-[hsl(var(--background-2))] border-border">
                                    {brands.map(b => (
                                        <SelectItem key={b.id} value={b.id} className="text-foreground/70 focus:bg-card focus:text-foreground">
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground/60 text-xs">Link Type</Label>
                            <Select value={shareLinkType} onValueChange={setShareLinkType}>
                                <SelectTrigger className="bg-card border-border text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[hsl(var(--background-2))] border-border">
                                    <SelectItem value="dashboard" className="text-foreground/70 focus:bg-card focus:text-foreground">Dashboard</SelectItem>
                                    <SelectItem value="report" className="text-foreground/70 focus:bg-card focus:text-foreground">Report</SelectItem>
                                    <SelectItem value="campaign" className="text-foreground/70 focus:bg-card focus:text-foreground">Campaign</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="text-foreground/60 text-xs">Password Protection</Label>
                            <button
                                type="button"
                                onClick={() => setSharePassword(!sharePassword)}
                                className={`p-1 rounded transition-colors ${sharePassword ? 'text-[hsl(var(--primary))]' : 'text-foreground/30'}`}
                            >
                                {sharePassword ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                            </button>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground/60 text-xs">Expiry Date (optional)</Label>
                            <Input
                                type="date"
                                value={shareExpiry}
                                onChange={e => setShareExpiry(e.target.value)}
                                className="bg-card/5 border-border text-foreground"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowShareDialog(false)} className="text-foreground/40 hover:text-foreground hover:bg-card/5">
                            Cancel
                        </Button>
                        <Button onClick={createShareLink} disabled={shareSubmitting} className="bg-[hsl(var(--primary))] hover:bg-primary/90 text-foreground">
                            {shareSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Link2 className="h-4 w-4 mr-1.5" />}
                            Create Link
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ────────── Dialog: Add Domain ────────── */}
            <Dialog open={showDomainDialog} onOpenChange={setShowDomainDialog}>
                <DialogContent className="bg-[#0F1629] border border-border text-foreground max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Add White-Label Domain</DialogTitle>
                        <DialogDescription className="text-foreground/40">Register a custom domain for branded client access.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="text-foreground/60 text-xs">Domain Name</Label>
                            <Input
                                placeholder="analytics.youragency.com"
                                value={domainName}
                                onChange={e => setDomainName(e.target.value)}
                                className="bg-card/5 border-border text-foreground placeholder:text-foreground/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground/60 text-xs">Brand Name</Label>
                            <Input
                                placeholder="Agency name for branding"
                                value={domainBrand}
                                onChange={e => setDomainBrand(e.target.value)}
                                className="bg-card/5 border-border text-foreground placeholder:text-foreground/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground/60 text-xs">Custom Logo URL (optional)</Label>
                            <Input
                                placeholder="https://..."
                                value={domainLogo}
                                onChange={e => setDomainLogo(e.target.value)}
                                className="bg-card/5 border-border text-foreground placeholder:text-foreground/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground/60 text-xs">Primary Color</Label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={domainColor}
                                    onChange={e => setDomainColor(e.target.value)}
                                    className="w-10 h-10 rounded-lg border border-border bg-transparent cursor-pointer"
                                />
                                <Input
                                    value={domainColor}
                                    onChange={e => setDomainColor(e.target.value)}
                                    className="bg-card/5 border-border text-foreground font-mono text-xs flex-1"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowDomainDialog(false)} className="text-foreground/40 hover:text-foreground hover:bg-card/5">
                            Cancel
                        </Button>
                        <Button onClick={createDomain} disabled={domainSubmitting} className="bg-[hsl(var(--primary))] hover:bg-primary/90 text-foreground">
                            {domainSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Globe className="h-4 w-4 mr-1.5" />}
                            Add Domain
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ────────── Dialog: Schedule Report ────────── */}
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                <DialogContent className="bg-[#0F1629] border border-border text-foreground max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Schedule Client Report</DialogTitle>
                        <DialogDescription className="text-foreground/40">Set up automated report delivery to clients.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="text-foreground/60 text-xs">Brand</Label>
                            <Select value={reportBrandId} onValueChange={setReportBrandId}>
                                <SelectTrigger className="bg-card border-border text-foreground">
                                    <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                                <SelectContent className="bg-[hsl(var(--background-2))] border-border">
                                    {brands.map(b => (
                                        <SelectItem key={b.id} value={b.id} className="text-foreground/70 focus:bg-card focus:text-foreground">
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground/60 text-xs">Frequency</Label>
                            <Select value={reportFrequency} onValueChange={setReportFrequency}>
                                <SelectTrigger className="bg-card border-border text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[hsl(var(--background-2))] border-border">
                                    <SelectItem value="daily" className="text-foreground/70 focus:bg-card focus:text-foreground">Daily</SelectItem>
                                    <SelectItem value="weekly" className="text-foreground/70 focus:bg-card focus:text-foreground">Weekly</SelectItem>
                                    <SelectItem value="monthly" className="text-foreground/70 focus:bg-card focus:text-foreground">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground/60 text-xs">Recipients (comma-separated emails)</Label>
                            <Input
                                placeholder="client@example.com, team@example.com"
                                value={reportRecipients}
                                onChange={e => setReportRecipients(e.target.value)}
                                className="bg-card/5 border-border text-foreground placeholder:text-foreground/20"
                            />
                        </div>
                        <div className="space-y-3 pt-1">
                            <Label className="text-foreground/60 text-xs">Include in Report</Label>
                            <div className="space-y-2">
                                {[
                                    { label: 'Scores', value: reportScores, setter: setReportScores, color: 'text-[hsl(var(--primary))]' },
                                    { label: 'Anomalies', value: reportAnomalies, setter: setReportAnomalies, color: 'text-warning' },
                                    { label: 'Benchmarks', value: reportBenchmarks, setter: setReportBenchmarks, color: 'text-blue-400' },
                                ].map(item => (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={() => item.setter(!item.value)}
                                        className="flex items-center justify-between w-full p-2.5 rounded-lg bg-card border border-border hover:border-border transition-colors"
                                    >
                                        <span className={`text-xs font-bold ${item.value ? item.color : 'text-foreground/30'}`}>{item.label}</span>
                                        {item.value ? <ToggleRight className={`h-5 w-5 ${item.color}`} /> : <ToggleLeft className="h-5 w-5 text-foreground/20" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowReportDialog(false)} className="text-foreground/40 hover:text-foreground hover:bg-card/5">
                            Cancel
                        </Button>
                        <Button onClick={createReport} disabled={reportSubmitting} className="bg-[hsl(var(--primary))] hover:bg-primary/90 text-foreground">
                            {reportSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Calendar className="h-4 w-4 mr-1.5" />}
                            Schedule Report
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
