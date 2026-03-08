import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlogPosts } from '@/hooks/useContent';
import NeonButton from '../ui/NeonButton';

interface BlogSectionProps {
  onViewPost: (slug: string) => void;
}

const BlogSection: React.FC<BlogSectionProps> = ({ onViewPost }) => {
  const { data: posts, isLoading } = useBlogPosts();

  if (isLoading || !posts) return (
    <section className="relative py-[var(--section-padding)] bg-background">
      <div className="max-w-7xl mx-auto px-6 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20 gap-8">
          <div>
            <div className="h-3 w-24 bg-white/5 rounded-full mb-4" />
            <div className="h-14 w-80 bg-white/5 rounded-xl" />
          </div>
          <div className="h-10 w-40 bg-white/5 rounded-full" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-96 bg-white/5 rounded-[2rem]" />)}
        </div>
      </div>
    </section>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <section id="blog" className="relative py-[var(--section-padding)] bg-background overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-block text-accent text-sm font-black uppercase tracking-[0.3em] mb-4"
            >
              Intelligence
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-black text-white leading-none tracking-tighter"
            >
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-destructive">Insights</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <NeonButton variant="secondary" onClick={() => { }}>
              Explore All Insights
            </NeonButton>
          </motion.div>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          <AnimatePresence>
            {posts.map((post: any, index: number) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative rounded-[2rem] overflow-hidden bg-[#111] border border-white/5 cursor-pointer hover:border-accent/30 transition-all duration-500"
                onClick={() => onViewPost(post.slug)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative h-64 overflow-hidden p-3">
                  <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
                    <motion.img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/20 to-transparent" />

                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-black/60 text-white backdrop-blur-md rounded-full border border-white/10">
                        {post.category || 'Trends'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-[1px] bg-accent/50" />
                    <time className="text-gray-500 text-[10px] uppercase font-black tracking-widest">
                      {formatDate(post.date)}
                    </time>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-accent transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center text-white text-xs font-black uppercase tracking-widest group-hover:text-accent transition-colors">
                      Read Impact
                      <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
