import React from 'react';
import { motion } from 'framer-motion';
import { useCaseStudies } from '@/hooks/useContent';
import NeonButton from '../ui/NeonButton';

interface CaseStudyModalProps {
  slug: string;
  onClose: () => void;
}

const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ slug, onClose }) => {
  const { data: caseStudies, isLoading } = useCaseStudies();
  const caseStudy = caseStudies?.find(cs => cs.slug === slug);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Case study not found</p>
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
      <div className="relative h-[60vh] min-h-[400px]">
        <img
          src={caseStudy.image}
          alt={caseStudy.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-20">
          <div className="max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-primary font-black uppercase tracking-[0.3em] mb-4 text-xs"
            >
              {caseStudy.client} • {caseStudy.category}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-black text-white mb-6 leading-none tracking-tighter"
            >
              {caseStudy.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-400 max-w-2xl leading-relaxed"
            >
              {caseStudy.description}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-24">
        {/* Results Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-12 rounded-[2.5rem] bg-card border border-white/5 mb-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          {JSON.parse(caseStudy.results).map((result: string, i: number) => (
            <div key={i} className="relative z-10 text-center">
              <div className="text-3xl font-black text-white mb-1">{result.split(' ')[0]}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{result.split(' ').slice(1).join(' ')}</div>
            </div>
          ))}
        </div>

        {/* Challenge & Solution */}
        <div className="grid gap-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4">
              <span className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              The Challenge
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">{caseStudy.challenge}</p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4">
              <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </span>
              Strategic Solution
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">{caseStudy.solution}</p>
          </div>
        </div>

        {/* Testimonial */}
        {caseStudy.testimonial && (
          <div className="mt-24 p-12 rounded-[2.5rem] bg-gradient-to-br from-[#111] to-black border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <svg className="w-16 h-16 text-primary/10 mb-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-2xl text-white font-medium leading-relaxed mb-8 italic">"{caseStudy.testimonial}"</p>
            <p className="text-primary font-black uppercase tracking-[0.2em] text-xs">— {caseStudy.author}</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-32 text-center">
          <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] mb-8">End of Transmission</p>
          <NeonButton
            variant="primary"
            size="lg"
            className="px-12 h-20 rounded-2xl text-xl"
            onClick={() => {
              onClose();
              setTimeout(() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }, 300);
            }}
          >
            Engineer Your Success
          </NeonButton>
        </div>
      </div>
    </div>
  );
};

export default CaseStudyModal;
