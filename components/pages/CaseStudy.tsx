"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useCaseStudies } from '@/hooks/useContent';
import SEO from '@/components/SEO';
import NeonButton from '@/components/ui/NeonButton';

const CaseStudy: React.FC = () => {
    const params = useParams();
    const slug = params?.slug as string;
    const router = useRouter();
    const { data: studies, isLoading } = useCaseStudies();
    const [activeImage, setActiveImage] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-destructive"></div>
            </div>
        );
    }

    const study = studies?.find((s: any) => s.slug === slug);

    if (!study) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
                <h1 className="text-4xl font-bold mb-4">Case Study Not Found</h1>
                <NeonButton variant="outline" onClick={() => router.push('/')}>
                    Back to Portfolio
                </NeonButton>
            </div>
        );
    }

    const results = JSON.parse(study.results || '[]');

    return (
        <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">
            <SEO
                title={study.metaTitle || `${study.title} - ${study.client}`}
                description={study.metaDescription || study.description}
                image={study.image}
                url={study.canonicalUrl || `https://wearecollaborative.net/work/${study.slug}`}
                type="article"
            />

            {/* Hero Section */}
            <div className="relative h-[80vh] w-full">
                <img
                    src={study.image}
                    alt={study.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

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
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4 mb-6"
                        >
                            <span className="px-3 py-1 text-xs font-black uppercase tracking-widest bg-destructive text-black rounded-full">
                                {study.category}
                            </span>
                            <span className="text-primary text-sm font-black uppercase tracking-widest">
                                {study.client}
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-8xl font-black text-white leading-tight mb-8"
                        >
                            {study.title}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-2xl text-gray-300 max-w-2xl font-light"
                        >
                            {study.description}
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* Impact Stats */}
            <div className="bg-[#111] border-y border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {results.map((res: string, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center md:text-left"
                            >
                                <div className="text-4xl md:text-5xl font-black text-white mb-2 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                                    {res.split(' ')[0]}
                                </div>
                                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                    {res.split(' ').slice(1).join(' ')}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Full Content */}
            <div className="max-w-4xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="prose prose-invert prose-xl max-w-none"
                >
                    <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                        {/* Mock content since specific full text isn't in seed yet */}
                        The partnership with {study.client} focused on identifying high-leverage growth opportunities within their existing funnel. By implementing our proprietary data-layering strategy, we were able to isolate underperforming segments and completely restructure their acquisition model.

                        <br /><br />
                        Our team deployed a multi-channel campaign that synchronized messaging across social, search, and programmatic display, resulting in a cohesive brand narrative that significantly increased conversion rates.
                    </p>
                </motion.div>
            </div>

            {/* Next Study CTA */}
            <div className="bg-primary/5 border-t border-primary/10 py-24 text-center">
                <h3 className="text-3xl font-bold text-white mb-8">Ready to achieve similar results?</h3>
                <NeonButton variant="primary" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                    Schedule a Strategy Call
                </NeonButton>
            </div>
        </div>
    );
};

export default CaseStudy;
