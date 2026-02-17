"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useContent';
import NeonButton from '@/components/ui/NeonButton';

const BlogPost: React.FC = () => {
    const params = useParams();
    const slug = params?.slug as string;
    const router = useRouter();
    const { data: posts, isLoading } = useBlogPosts();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    const post = posts?.find((p: any) => p.slug === slug);

    if (!post) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
                <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
                <NeonButton variant="primary" onClick={() => router.push('/')}>
                    Back to Home
                </NeonButton>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">
            {/* Hero Image */}
            <div className="relative h-[60vh] w-full">
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />

                <div className="absolute top-8 left-8 z-20">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:border-white/30"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">Back</span>
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4 mb-6"
                        >
                            <span className="px-3 py-1 text-xs font-black uppercase tracking-widest bg-primary text-black rounded-full">
                                {post.category || 'Insights'}
                            </span>
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest border-l border-gray-600 pl-4">
                                {new Date(post.date).toLocaleDateString('en-US', {
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-white leading-tight mb-8"
                        >
                            {post.title}
                        </motion.h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="prose prose-invert prose-lg max-w-none"
                >
                    <div className="text-xl text-gray-300 mb-12 font-medium leading-relaxed border-l-4 border-accent pl-6 italic">
                        {post.excerpt}
                    </div>

                    <div className="text-gray-400 leading-relaxed whitespace-pre-line">
                        {post.content}
                    </div>
                </motion.div>

                {/* Share / CTA Footer */}
                <div className="mt-20 pt-12 border-t border-white/10 text-center">
                    <h3 className="text-2xl font-bold text-white mb-6">Ready to collaborate?</h3>
                    <NeonButton variant="primary" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                        Start a Project
                    </NeonButton>
                </div>
            </div>
        </div>
    );
};

export default BlogPost;
