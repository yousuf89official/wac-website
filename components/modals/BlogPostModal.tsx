import React from 'react';
import { useBlogPosts } from '@/hooks/useContent';
import NeonButton from '../ui/NeonButton';

interface BlogPostModalProps {
  slug: string;
  onClose: () => void;
}

const BlogPostModal: React.FC<BlogPostModalProps> = ({ slug, onClose }) => {
  const { data: posts, isLoading } = useBlogPosts();
  const post = posts?.find((p: any) => p.slug === slug);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#b000ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Blog post not found</p>
          <NeonButton onClick={onClose}>Go Back</NeonButton>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-auto">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover grayscale opacity-40 hover:grayscale-0 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 -mt-40 relative z-10">
        {/* Meta */}
        <div className="flex items-center gap-4 mb-8">
          <span className="px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] bg-accent/20 text-accent rounded-full border border-accent/30 backdrop-blur-md">
            {post.category}
          </span>
          <span className="text-gray-500 font-black tracking-widest text-[10px] uppercase">{formatDate(post.date)}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black text-white mb-8 leading-none tracking-tighter">
          {post.title}
        </h1>

        {/* Author */}
        <div className="flex items-center gap-4 mb-16 pb-12 border-b border-white/5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
            {post.author.charAt(0)}
          </div>
          <div>
            <p className="text-white font-black uppercase tracking-widest text-sm">{post.author}</p>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Strategic Analyst</p>
          </div>
        </div>

        {/* Excerpt */}
        <p className="text-2xl text-gray-300 font-medium leading-relaxed mb-12 italic border-l-4 border-primary pl-8">
          {post.excerpt}
        </p>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            {post.content || 'Full article content coming soon...'}
          </p>
        </div>

        {/* Tags */}
        {post.tags && (
          <div className="mt-16 pt-12 border-t border-white/5">
            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] mb-6">Taxonomy</p>
            <div className="flex flex-wrap gap-3">
              {JSON.parse(post.tags).map((tag: string, i: number) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-white/5 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all cursor-pointer border border-white/5 hover:border-primary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-24 mb-24 p-12 rounded-[2.5rem] bg-gradient-to-br from-[#111] to-black border border-white/5 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Intelligence Feed</h3>
          <p className="text-gray-500 font-medium mb-10 max-w-md mx-auto">Join the high-performance network for weekly strategic market analysis and growth signals.</p>
          <NeonButton
            variant="primary"
            className="px-10 h-16 rounded-2xl"
            onClick={() => {
              onClose();
              setTimeout(() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }, 300);
            }}
          >
            Join the Network
          </NeonButton>
        </div>
      </div>
    </div>
  );
};

export default BlogPostModal;
