"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquare, Plus, ChevronRight, MessageCircle } from 'lucide-react';

interface CommunityPost {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    course: { title: string } | null;
    customer: { firstName: string; lastName: string };
    _count: { replies: number };
}

export default function CommunityPage() {
    const t = useTranslations('dashboard');
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-white tracking-tighter">{t('community')}</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                    <Plus className="w-4 h-4" /> {t('createPost')}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            {t('postTitle')}
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            {t('postContent')}
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            required
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors resize-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {submitting ? '...' : t('createPost')}
                    </button>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : posts.length === 0 ? (
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">{t('noPosts')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {posts.map((post) => (
                        <div key={post.id} className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 hover:bg-white/[0.06] transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-semibold">{post.title}</h3>
                                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{post.content}</p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="text-xs text-gray-500">
                                            {post.customer.firstName} {post.customer.lastName}
                                        </span>
                                        <span className="text-xs text-gray-600">{new Date(post.createdAt).toLocaleDateString()}</span>
                                        {post.course && (
                                            <span className="text-xs text-primary/60">{post.course.title}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-500 flex-shrink-0">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-xs">{post._count.replies}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
