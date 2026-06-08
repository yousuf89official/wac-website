'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Copy, Check, Trash2, RefreshCw, Instagram } from 'lucide-react';

// ─── Shared types & helpers ───

interface IgResult {
    shortcode: string;
    mediaId: string | null;
    postType: string;
    postTypeLabel: string;
    originalUrl: string;
}

interface TtResult {
    videoId: string | null;
    shortCode?: string;
    username: string | null;
    postType: string;
    postTypeLabel: string;
    originalUrl: string;
    isShortUrl: boolean;
}

interface HistoryItem {
    id: string;
    shortcode?: string;
    mediaId?: string;
    videoId?: string | null;
    shortCode?: string | null;
    username?: string | null;
    postType: string;
    originalUrl: string;
    isShortUrl?: boolean;
    createdAt: string;
}

// Type tones map to semantic tokens — keep distinct hues but in muted editorial palette
const IG_TYPE_TONES: Record<string, string> = {
    post: 'text-primary',
    reel: 'text-accent',
    tv: 'text-accent',
    story: 'text-success',
};

const TT_TYPE_TONES: Record<string, string> = {
    video: 'text-primary',
    photo: 'text-accent',
    embed: 'text-accent',
    share: 'text-success',
    short: 'text-primary',
    trending: 'text-primary',
};

const IG_EXAMPLES = [
    { type: 'Post', url: 'https://www.instagram.com/p/C8W9X7ys1aR/' },
    { type: 'Reel', url: 'https://www.instagram.com/reel/DAhK2L_ySzJ/' },
    { type: 'IGTV', url: 'https://www.instagram.com/tv/CWtB3xYJhFm/' },
    { type: 'Story', url: 'https://www.instagram.com/stories/instagram/3456789012345678901/' },
];

const TT_EXAMPLES = [
    { type: 'Video', url: 'https://www.tiktok.com/@charlidamelio/video/7067695578729221378' },
    { type: 'Photo', url: 'https://www.tiktok.com/@username/photo/7234567890123456789' },
    { type: 'Short', url: 'https://vm.tiktok.com/ZMF6rgvXY/' },
    { type: 'Mobile', url: 'https://m.tiktok.com/v/6749869095467945218.html' },
];

// ─── Copy button ───

function CopyButton({ text, label }: { text: string; label: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <button
            onClick={handleCopy}
            title={`Copy ${label}`}
            className="p-1 text-foreground-soft transition-colors hover:text-foreground"
        >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
        </button>
    );
}

// ─── Type badge ───

function TypeBadge({ type, toneMap }: { type: string; toneMap: Record<string, string> }) {
    const tone = toneMap[type] || 'text-foreground-soft';
    return (
        <span className={`font-mono text-2xs uppercase tracking-widest ${tone}`}>
            {type?.toUpperCase()}
        </span>
    );
}

// ─── Result row ───

function ResultRow({ label, value }: { label: string; value: string | null }) {
    if (!value) return null;
    return (
        <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
            <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                {label}
            </span>
            <div className="flex items-center gap-3">
                <code className="max-w-[300px] truncate font-mono text-sm text-foreground">
                    {value}
                </code>
                <CopyButton text={value} label={label} />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════
// Instagram Extractor Tab
// ═══════════════════════════════════════

function IgExtractorTab() {
    const [inputUrl, setInputUrl] = useState('');
    const [result, setResult] = useState<IgResult | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        try {
            const res = await fetch('/api/ig-extract/history?limit=20');
            const json = await res.json();
            if (json.success) setHistory(json.data || []);
        } catch { /* non-critical */ } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const handleExtract = useCallback(async (url?: string) => {
        const target = url || inputUrl;
        if (!target.trim()) { setError('Please enter an Instagram URL'); return; }

        setError(''); setLoading(true); setResult(null);
        try {
            const res = await fetch('/api/ig-extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: target.trim() }),
            });
            const json = await res.json();
            if (!json.success) { setError(json.error || 'Extraction failed'); return; }
            setResult(json.data);
            if (json.saved) fetchHistory();
        } catch { setError('Network error — could not reach the server.'); }
        finally { setLoading(false); }
    }, [inputUrl, fetchHistory]);

    const handleDelete = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/ig-extract/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) setHistory(prev => prev.filter(item => item.id !== id));
        } catch { /* silent */ }
    }, []);

    const handleClear = () => { setInputUrl(''); setResult(null); setError(''); inputRef.current?.focus(); };

    return (
        <div className="space-y-10">
            {/* Input card */}
            <div className="border border-border bg-card p-8">
                <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        Instagram
                    </span>
                    <span className="inline-block h-px w-8 bg-foreground-soft" />
                    <span className="font-mono text-2xs uppercase tracking-widest text-primary">
                        URL input
                    </span>
                </div>
                <h3 className="mb-2 font-display text-2xl font-medium leading-tight tracking-tight text-foreground">
                    Paste a post, reel, IGTV, or story link.
                </h3>
                <p className="mb-6 font-serif text-sm leading-relaxed text-foreground-soft">
                    We return the shortcode, numeric media ID, and a cleaned canonical URL.
                </p>

                <label htmlFor="ig-url" className="mb-2 block font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                    Instagram URL
                </label>
                <div className="flex gap-3">
                    <input
                        ref={inputRef}
                        id="ig-url"
                        type="url"
                        className={`flex-1 border bg-background-2 px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-foreground-soft/60 focus:border-foreground/40 focus:outline-none ${error ? 'border-destructive/50' : 'border-border'}`}
                        placeholder="Paste Instagram URL here…"
                        value={inputUrl}
                        onChange={e => { setInputUrl(e.target.value); if (error) setError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleExtract()}
                        autoComplete="off"
                        spellCheck={false}
                    />
                    <button
                        className="bg-primary px-6 py-2.5 font-mono text-2xs uppercase tracking-widest text-background transition-colors hover:bg-foreground disabled:opacity-50"
                        onClick={() => handleExtract()}
                        disabled={loading}
                    >
                        {loading ? 'Extracting…' : 'Extract'}
                    </button>
                </div>
                {error && <p className="mt-3 font-mono text-2xs uppercase tracking-widest text-destructive">{error}</p>}
                {result && (
                    <button
                        className="mt-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft underline-offset-4 hover:text-foreground hover:underline"
                        onClick={handleClear}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Results */}
            {result && (
                <div className="border border-border bg-card p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
                            Extraction results
                        </h3>
                        <TypeBadge type={result.postType} toneMap={IG_TYPE_TONES} />
                    </div>
                    <ResultRow label="Shortcode" value={result.shortcode} />
                    <ResultRow label="Media ID" value={result.mediaId} />
                    <ResultRow label="Post Type" value={result.postType.toUpperCase()} />
                    <ResultRow label="Clean URL" value={result.originalUrl} />
                </div>
            )}

            {/* Empty state */}
            {!result && !error && (
                <div className="border border-dashed border-border bg-card p-10 text-center">
                    <p className="font-serif text-base italic text-foreground-soft">
                        Paste an Instagram URL above to extract the shortcode and numeric media ID.
                    </p>
                </div>
            )}

            {/* Examples */}
            <div>
                <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        Try an example
                    </span>
                    <span className="inline-block h-px w-8 bg-foreground-soft" />
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {IG_EXAMPLES.map(ex => (
                        <button
                            key={ex.type}
                            className="border border-border bg-card p-4 text-left transition-colors hover:border-foreground/30"
                            onClick={() => { setInputUrl(ex.url); handleExtract(ex.url); }}
                        >
                            <span className="block font-mono text-2xs uppercase tracking-widest text-primary">{ex.type}</span>
                            <code className="mt-1 block truncate font-mono text-2xs text-foreground-soft">
                                {ex.url.replace('https://www.', '')}
                            </code>
                        </button>
                    ))}
                </div>
            </div>

            {/* History */}
            {history.length > 0 && (
                <div className="border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border px-6 py-5">
                        <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
                            Recent extractions
                        </h3>
                        <button
                            onClick={fetchHistory}
                            disabled={historyLoading}
                            className="p-1.5 text-foreground-soft transition-colors hover:text-foreground"
                        >
                            <RefreshCw size={14} className={historyLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border text-left">
                                    <th className="px-6 py-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft">Type</th>
                                    <th className="px-6 py-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft">Shortcode</th>
                                    <th className="px-6 py-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft">Media ID</th>
                                    <th className="px-6 py-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft">Date</th>
                                    <th className="w-10 px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(item => (
                                    <tr key={item.id} className="border-b border-border last:border-0 hover:bg-foreground/[0.03]">
                                        <td className="px-6 py-4"><TypeBadge type={item.postType} toneMap={IG_TYPE_TONES} /></td>
                                        <td className="px-6 py-4"><code className="font-mono text-sm text-foreground">{item.shortcode}</code></td>
                                        <td className="px-6 py-4"><code className="block max-w-[150px] truncate font-mono text-sm text-foreground-soft">{item.mediaId}</code></td>
                                        <td className="px-6 py-4 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                            {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1 text-foreground-soft transition-colors hover:text-destructive"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════
// TikTok Extractor Tab
// ═══════════════════════════════════════

function TtExtractorTab() {
    const [inputUrl, setInputUrl] = useState('');
    const [result, setResult] = useState<TtResult | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        try {
            const res = await fetch('/api/tt-extract/history?limit=20');
            const json = await res.json();
            if (json.success) setHistory(json.data || []);
        } catch { /* non-critical */ } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const handleExtract = useCallback(async (url?: string) => {
        const target = url || inputUrl;
        if (!target.trim()) { setError('Please enter a TikTok URL'); return; }

        setError(''); setLoading(true); setResult(null);
        try {
            const res = await fetch('/api/tt-extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: target.trim() }),
            });
            const json = await res.json();
            if (!json.success) { setError(json.error || 'Extraction failed'); return; }
            setResult(json.data);
            if (json.saved) fetchHistory();
        } catch { setError('Network error — could not reach the server.'); }
        finally { setLoading(false); }
    }, [inputUrl, fetchHistory]);

    const handleDelete = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/tt-extract/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) setHistory(prev => prev.filter(item => item.id !== id));
        } catch { /* silent */ }
    }, []);

    const handleClear = () => { setInputUrl(''); setResult(null); setError(''); inputRef.current?.focus(); };

    return (
        <div className="space-y-10">
            {/* Input card */}
            <div className="border border-border bg-card p-8">
                <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        TikTok
                    </span>
                    <span className="inline-block h-px w-8 bg-foreground-soft" />
                    <span className="font-mono text-2xs uppercase tracking-widest text-primary">
                        URL input
                    </span>
                </div>
                <h3 className="mb-2 font-display text-2xl font-medium leading-tight tracking-tight text-foreground">
                    Paste a video, photo, or short link.
                </h3>
                <p className="mb-6 font-serif text-sm leading-relaxed text-foreground-soft">
                    We return the numeric video ID, username, and a cleaned canonical URL.
                </p>

                <label htmlFor="tt-url" className="mb-2 block font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                    TikTok URL
                </label>
                <div className="flex gap-3">
                    <input
                        ref={inputRef}
                        id="tt-url"
                        type="url"
                        className={`flex-1 border bg-background-2 px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-foreground-soft/60 focus:border-foreground/40 focus:outline-none ${error ? 'border-destructive/50' : 'border-border'}`}
                        placeholder="Paste TikTok URL here…"
                        value={inputUrl}
                        onChange={e => { setInputUrl(e.target.value); if (error) setError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleExtract()}
                        autoComplete="off"
                        spellCheck={false}
                    />
                    <button
                        className="bg-primary px-6 py-2.5 font-mono text-2xs uppercase tracking-widest text-background transition-colors hover:bg-foreground disabled:opacity-50"
                        onClick={() => handleExtract()}
                        disabled={loading}
                    >
                        {loading ? 'Extracting…' : 'Extract'}
                    </button>
                </div>
                {error && <p className="mt-3 font-mono text-2xs uppercase tracking-widest text-destructive">{error}</p>}
                {result && (
                    <button
                        className="mt-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft underline-offset-4 hover:text-foreground hover:underline"
                        onClick={handleClear}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Results */}
            {result && (
                <div className="border border-border bg-card p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
                            Extraction results
                        </h3>
                        <TypeBadge type={result.postType} toneMap={TT_TYPE_TONES} />
                    </div>
                    {result.videoId && <ResultRow label="Video ID" value={result.videoId} />}
                    {result.shortCode && !result.videoId && <ResultRow label="Short Code" value={result.shortCode} />}
                    {result.username && <ResultRow label="Username" value={`@${result.username}`} />}
                    <ResultRow label="Post Type" value={result.postType.toUpperCase()} />
                    <ResultRow label="Clean URL" value={result.originalUrl} />
                    {result.isShortUrl && (
                        <div className="mt-6 border border-warning/30 bg-warning/5 p-4 font-mono text-2xs uppercase tracking-widest text-warning">
                            Short URLs (vm.tiktok.com) cannot be fully resolved client-side. The video ID requires server-side redirect follow.
                        </div>
                    )}
                </div>
            )}

            {/* Empty state */}
            {!result && !error && (
                <div className="border border-dashed border-border bg-card p-10 text-center">
                    <p className="font-serif text-base italic text-foreground-soft">
                        Paste a TikTok URL above to extract the video ID, username, and post metadata.
                    </p>
                </div>
            )}

            {/* Examples */}
            <div>
                <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        Try an example
                    </span>
                    <span className="inline-block h-px w-8 bg-foreground-soft" />
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {TT_EXAMPLES.map(ex => (
                        <button
                            key={ex.type}
                            className="border border-border bg-card p-4 text-left transition-colors hover:border-foreground/30"
                            onClick={() => { setInputUrl(ex.url); handleExtract(ex.url); }}
                        >
                            <span className="block font-mono text-2xs uppercase tracking-widest text-primary">{ex.type}</span>
                            <code className="mt-1 block truncate font-mono text-2xs text-foreground-soft">
                                {ex.url.replace('https://www.', '').replace('https://', '')}
                            </code>
                        </button>
                    ))}
                </div>
            </div>

            {/* History */}
            {history.length > 0 && (
                <div className="border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border px-6 py-5">
                        <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
                            Recent extractions
                        </h3>
                        <button
                            onClick={fetchHistory}
                            disabled={historyLoading}
                            className="p-1.5 text-foreground-soft transition-colors hover:text-foreground"
                        >
                            <RefreshCw size={14} className={historyLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border text-left">
                                    <th className="px-6 py-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft">Type</th>
                                    <th className="px-6 py-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft">Video ID</th>
                                    <th className="px-6 py-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft">Username</th>
                                    <th className="px-6 py-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft">Date</th>
                                    <th className="w-10 px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(item => (
                                    <tr key={item.id} className="border-b border-border last:border-0 hover:bg-foreground/[0.03]">
                                        <td className="px-6 py-4"><TypeBadge type={item.postType} toneMap={TT_TYPE_TONES} /></td>
                                        <td className="px-6 py-4">
                                            <code className="block max-w-[180px] truncate font-mono text-sm text-foreground-soft">
                                                {item.videoId || item.shortCode || '—'}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.username
                                                ? <code className="font-mono text-sm text-foreground">@{item.username}</code>
                                                : <span className="text-foreground-soft">—</span>}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                            {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1 text-foreground-soft transition-colors hover:text-destructive"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════
// Main Page
// ═══════════════════════════════════════

export default function ExtractorsPage() {
    return (
        <div className="space-y-16 pb-24">
            {/* Editorial header */}
            <header>
                <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        Intelligence
                    </span>
                    <span className="inline-block h-px w-8 bg-foreground-soft" />
                    <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        Tools
                    </span>
                    <span className="inline-block h-px w-8 bg-foreground-soft" />
                    <span className="font-mono text-2xs uppercase tracking-widest text-primary">
                        Extractors
                    </span>
                </div>
                <h1 className="font-display text-[clamp(2.25rem,4.5vw,3.25rem)] font-medium leading-[0.96] tracking-tightest text-foreground">
                    Extractors.
                </h1>
                <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-foreground-soft">
                    Pull the canonical post ID, shortcode, and metadata from any Instagram or
                    TikTok URL — for tagging, attribution, and the report archive.
                </p>
            </header>

            <Tabs defaultValue="instagram" className="w-full">
                <TabsList className="mb-10 inline-flex gap-1 border border-border bg-card p-1">
                    <TabsTrigger
                        value="instagram"
                        className="rounded-none px-4 py-2 font-mono text-2xs uppercase tracking-widest data-[state=active]:bg-foreground data-[state=active]:text-background"
                    >
                        <Instagram size={14} className="mr-2" />
                        Instagram
                    </TabsTrigger>
                    <TabsTrigger
                        value="tiktok"
                        className="rounded-none px-4 py-2 font-mono text-2xs uppercase tracking-widest data-[state=active]:bg-foreground data-[state=active]:text-background"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.11a8.16 8.16 0 003.76.92V6.69z" />
                        </svg>
                        TikTok
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="instagram">
                    <IgExtractorTab />
                </TabsContent>

                <TabsContent value="tiktok">
                    <TtExtractorTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
