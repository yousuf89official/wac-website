"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageHero from '@/components/shared/PageHero';
import { fadeInUp, staggerContainer, staggerItem, scaleOnHover, sectionViewport, sectionPadding, sectionMaxWidth, cardBase } from '@/lib/design-system';

interface BlogPost {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    image: string;
    category: string;
    author: string;
    date: string;
}

interface ResourcesContentProps {
    posts: BlogPost[];
    categories: string[];
}

export default function ResourcesContent({ posts, categories }: ResourcesContentProps) {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [search, setSearch] = useState("");

    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            const matchesCategory = activeCategory === "All" || post.category === activeCategory;
            const matchesSearch = search === "" ||
                post.title.toLowerCase().includes(search.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(search.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [posts, activeCategory, search]);

    const allCategories = ["All", ...categories];

    return (
        <>
            <PageHero
                title="Insights & Resources"
                subtitle="Our Blog"
                description="Expert perspectives on digital marketing, SEO, content strategy, and growing your business online."
            />

            {/* Filters */}
            <section className="pb-8">
                <div className={sectionMaxWidth}>
                    {/* Category Pills */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        {allCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                    activeCategory === cat
                                        ? 'bg-primary text-black'
                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>
            </section>

            {/* Posts Grid */}
            <section className={sectionPadding}>
                <div className={sectionMaxWidth}>
                    {filteredPosts.length === 0 ? (
                        <motion.p {...fadeInUp} className="text-center text-gray-500 text-lg py-20">
                            No articles found. Try a different search or category.
                        </motion.p>
                    ) : (
                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            whileInView="animate"
                            viewport={sectionViewport}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {filteredPosts.map((post) => (
                                <motion.article
                                    key={post.id}
                                    variants={staggerItem}
                                    {...scaleOnHover}
                                    onClick={() => router.push(`/resources/${post.slug}`)}
                                    className={`${cardBase} overflow-hidden cursor-pointer group`}
                                >
                                    {post.image && (
                                        <div className="aspect-video overflow-hidden">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                                {post.category}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(post.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 line-clamp-3">
                                            {post.excerpt}
                                        </p>
                                        <div className="mt-4 text-sm text-primary font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                            Read more
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className={`${sectionPadding} bg-white/[0.02]`}>
                <div className={`${sectionMaxWidth} text-center max-w-2xl`}>
                    <motion.div {...fadeInUp} viewport={sectionViewport}>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-4">
                            Stay Ahead of the Curve
                        </h2>
                        <p className="text-gray-400 mb-8">
                            Get our latest insights delivered straight to your inbox. No spam, just actionable marketing intelligence.
                        </p>
                        <div className="flex gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#b000ff] text-white font-bold text-sm hover:opacity-90 transition-opacity shrink-0">
                                Subscribe
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
