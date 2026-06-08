"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface Reply {
    id: number;
    content: string;
    createdAt: string;
    customer: { firstName: string; lastName: string };
}

interface PostDetail {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    course: { title: string } | null;
    customer: { firstName: string; lastName: string };
    replies: Reply[];
}

const ease = [0.16, 1, 0.3, 1] as const;

export default function CommunityPostPage() {
    const params = useParams<{ id: string }>();
    const postId = params?.id;

    const [post, setPost] = useState<PostDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!postId) return;
        fetchPost();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId]);

    const fetchPost = async () => {
        setLoading(true);
        const res = await fetch(`/api/portal/community/${postId}`);
        if (res.status === 404) {
            setNotFound(true);
        } else if (res.ok) {
            const data = await res.json();
            setPost(data.post);
        }
        setLoading(false);
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        setSubmitting(true);
        const res = await fetch(`/api/portal/community/${postId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: replyContent }),
        });
        if (res.ok) {
            setReplyContent('');
            fetchPost();
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (notFound || !post) {
        return (
            <div className="space-y-12">
                <Link href="/dashboard/community" className="inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft hover:text-foreground transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> Back to community
                </Link>
                <div className="border border-foreground/10 p-12 text-center">
                    <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-4">404</p>
                    <p className="font-serif text-foreground-soft">This post can't be found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <Link
                href="/dashboard/community"
                className="inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> Back to community
            </Link>

            <motion.article
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease }}
                className="border-y border-foreground/10 py-10 md:py-14"
            >
                <p className="eyebrow mb-3">PORTAL / COMMUNITY / POST</p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">{post.title}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                    <span>{post.customer.firstName} {post.customer.lastName}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    {post.course && <span className="text-primary/80">{post.course.title}</span>}
                </div>
                <p className="font-serif text-lg leading-relaxed text-foreground mt-8 whitespace-pre-wrap max-w-3xl">{post.content}</p>
            </motion.article>

            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <span className="inline-block h-px w-10 bg-foreground-soft" />
                    <h2 className="eyebrow">Replies ({post.replies.length})</h2>
                </div>

                {post.replies.length === 0 ? (
                    <div className="border border-foreground/10 p-10 text-center">
                        <p className="font-serif text-foreground-soft">No replies yet — be the first to weigh in.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
                        {post.replies.map((reply, i) => (
                            <motion.li
                                key={reply.id}
                                initial={{ opacity: 0, x: -8 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.6, ease, delay: i * 0.04 }}
                                className="grid grid-cols-12 gap-x-6 gap-y-2 py-6 md:py-8"
                            >
                                <span className="col-span-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft md:col-span-1">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <div className="col-span-10 md:col-span-11">
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                        <span>{reply.customer.firstName} {reply.customer.lastName}</span>
                                        <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="font-serif text-base leading-relaxed text-foreground mt-3 whitespace-pre-wrap">{reply.content}</p>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                )}
            </section>

            <form onSubmit={handleReply} className="border border-foreground/10 p-6 md:p-8 space-y-6">
                <label className="block font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                    Your reply
                </label>
                <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    required
                    rows={5}
                    className="w-full bg-transparent border-b border-foreground/15 py-3 font-serif text-lg text-foreground placeholder-foreground-soft focus:border-primary focus:outline-none transition-colors resize-none"
                />
                <button
                    type="submit"
                    disabled={submitting || !replyContent.trim()}
                    className="inline-flex h-12 items-center px-6 rounded-full bg-primary text-primary-foreground text-2xs font-semibold uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {submitting ? 'Posting…' : 'Post reply'}
                </button>
            </form>
        </div>
    );
}
