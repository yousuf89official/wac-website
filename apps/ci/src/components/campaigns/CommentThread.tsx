'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Send, MessageSquare, Loader2 } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Comment {
    id: string;
    campaignId: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
}

interface CommentThreadProps {
    campaignId: string;
    campaignName?: string;
}

// ─── Relative Time Helper ───────────────────────────────────────────────────

function timeAgo(dateString: string): string {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;

    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

// ─── Avatar ─────────────────────────────────────────────────────────────────

function UserAvatar({ name }: { name: string }) {
    const letter = (name || '?').charAt(0).toUpperCase();
    return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/20 text-sm font-bold text-[#0D9488]">
            {letter}
        </div>
    );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CommentThread({ campaignId, campaignName }: CommentThreadProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // ── Fetch comments ────────────────────────────────────────────────────

    const fetchComments = useCallback(async () => {
        try {
            const data = await api.campaigns.getComments(campaignId);
            setComments(data);
        } catch {
            // Silently fail on auto-refresh; toast only on initial load handled below
        }
    }, [campaignId]);

    useEffect(() => {
        let active = true;

        async function loadInitial() {
            try {
                const data = await api.campaigns.getComments(campaignId);
                if (active) {
                    setComments(data);
                }
            } catch {
                if (active) {
                    toast.error('Failed to load comments');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadInitial();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchComments, 30_000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [campaignId, fetchComments]);

    // ── Submit new comment ────────────────────────────────────────────────

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = content.trim();
        if (!trimmed || submitting) return;

        setSubmitting(true);
        try {
            const newComment = await api.campaigns.addComment(campaignId, trimmed);
            setComments((prev) => [newComment, ...prev]);
            setContent('');
            // Scroll to top to see the new comment (newest first)
            scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            toast.error('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    }

    // ── Keyboard shortcut: Cmd/Ctrl+Enter to submit ─────────────────────

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    }

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.03]">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
                <MessageSquare className="h-4 w-4 text-white/50" />
                <span className="text-sm font-medium text-white/80">Comments</span>
                {!loading && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/[0.08] px-1.5 text-xs text-white/50">
                        {comments.length}
                    </span>
                )}
                {campaignName && (
                    <span className="ml-auto truncate text-xs text-white/30" title={campaignName}>
                        {campaignName}
                    </span>
                )}
            </div>

            {/* Comment list */}
            <div ref={scrollRef} className="max-h-[400px] overflow-y-auto px-4 py-3">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-white/30" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="py-8 text-center text-sm text-white/30">
                        No comments yet. Start the conversation!
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 rounded-lg bg-white/[0.04] p-3">
                                <UserAvatar name={comment.userName} />
                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-semibold text-white/90">
                                            {comment.userName}
                                        </span>
                                        <span className="text-xs text-white/30">
                                            {timeAgo(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/60">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* New comment input */}
            <form onSubmit={handleSubmit} className="border-t border-white/[0.06] px-4 py-3">
                <div className="flex gap-2">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a comment..."
                        rows={2}
                        disabled={submitting}
                        className="flex-1 resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80 placeholder-white/25 outline-none transition focus:border-[#0D9488]/40 focus:ring-1 focus:ring-[#0D9488]/20 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={submitting || !content.trim()}
                        className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-lg bg-[#0D9488] text-white transition hover:bg-[#0D9488]/80 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Send comment (Ctrl+Enter)"
                    >
                        {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
