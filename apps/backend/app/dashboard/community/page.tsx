"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, MessageCircle, ArrowUpRight } from 'lucide-react';

interface CommunityPost {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    course: { title: string } | null;
    customer: { firstName: string; lastName: string };
    _count: { replies: number };
}

const ease = [0.16, 1, 0.3, 1] as const;

export default function CommunityPage() {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = () => {
        fetch('/api/portal/community')
            .then(res => res.ok ? res.json() : { posts: [] })
            .then(data => setPosts(data.posts || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/portal/community', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setFormData({ title: '', content: '' });
                setShowForm(false);
                fetchPosts();
            }
        } catch {
            // silently fail
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-12">
            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease }}
                className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
            >
                <div>
                    <p className="eyebrow mb-3">PORTAL / COMMUNITY</p>
                    <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">Community</h1>
                    <p className="font-serif text-foreground-soft mt-3 text-lg max-w-2xl">
                        Conversations from inside the cohort. Ask a question, share a win, leave a breadcrumb for the next reader.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex h-12 items-center gap-2 px-6 rounded-full bg-primary text-primary-foreground text-2xs font-semibold uppercase tracking-widest hover:bg-primary/90 transition-colors flex-shrink-0"
                >
                    <Plus className="w-4 h-4" strokeWidth={1.75} /> {showForm ? 'Close' : 'New post'}
                </button>
            </motion.header>

            {showForm && (
                <motion.form
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease }}
                    onSubmit={handleSubmit}
                    className="border border-foreground/10 p-6 md:p-8 space-y-6"
                >
                    <div>
                        <label className="block font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="w-full bg-transparent border-b border-foreground/15 py-3 font-serif text-lg text-foreground placeholder-foreground-soft focus:border-primary focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-2">
                            Content
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            required
                            rows={5}
                            className="w-full bg-transparent border-b border-foreground/15 py-3 font-serif text-lg text-foreground placeholder-foreground-soft focus:border-primary focus:outline-none transition-colors resize-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex h-12 items-center px-6 rounded-full bg-primary text-primary-foreground text-2xs font-semibold uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Posting…' : 'Publish post'}
                    </button>
                </motion.form>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : posts.length === 0 ? (
                <div className="border border-foreground/10 p-12 text-center">
                    <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-4">No posts yet</p>
                    <p className="font-serif text-foreground-soft">The room is quiet. Be the first to speak up.</p>
                </div>
            ) : (
                <motion.ul
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.7, ease }}
                    className="divide-y divide-foreground/10 border-y border-foreground/10"
                >
                    {posts.map((post, i) => (
                        <motion.li
                            key={post.id}
                            initial={{ opacity: 0, x: -8 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.6, ease, delay: i * 0.04 }}
                        >
                            <Link
                                href={`/dashboard/community/${post.id}`}
                                className="group grid grid-cols-12 items-baseline gap-x-6 gap-y-2 py-6 transition-colors hover:bg-foreground/[0.03] md:py-8"
                            >
                                <span className="col-span-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft md:col-span-1">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <div className="col-span-10 md:col-span-8">
                                    <h3 className="font-display text-2xl font-medium tracking-tight transition-colors group-hover:text-primary md:text-3xl">
                                        {post.title}
                                    </h3>
                                    <p className="font-serif text-foreground-soft mt-2 line-clamp-2">{post.content}</p>
                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                        <span>{post.customer.firstName} {post.customer.lastName}</span>
                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                        {post.course && <span className="text-primary/80">{post.course.title}</span>}
                                    </div>
                                </div>
                                <div className="col-span-10 md:col-span-2 md:text-right flex items-center md:justify-end gap-1.5 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                    <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    <span>{post._count.replies} {post._count.replies === 1 ? 'reply' : 'replies'}</span>
                                </div>
                                <ArrowUpRight
                                    className="col-span-2 hidden h-5 w-5 -translate-x-1 text-foreground-soft transition-all duration-500 ease-editorial group-hover:translate-x-0 group-hover:text-primary md:col-span-1 md:inline md:justify-self-end"
                                    strokeWidth={1.25}
                                />
                            </Link>
                        </motion.li>
                    ))}
                </motion.ul>
            )}
        </div>
    );
}
