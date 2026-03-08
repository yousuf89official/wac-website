import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCaseStudies } from '@/hooks/useContent';
import NeonButton from '../ui/NeonButton';

interface CaseStudiesSectionProps {
  onViewCaseStudy: (slug: string) => void;
}

const CaseStudiesSection: React.FC<CaseStudiesSectionProps> = ({ onViewCaseStudy }) => {
  const { data: caseStudies, isLoading } = useCaseStudies();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  if (isLoading || !caseStudies) return (
    <section className="relative py-[var(--section-padding)] bg-background">
      <div className="max-w-7xl mx-auto px-6 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <div>
            <div className="h-3 w-20 bg-white/5 rounded-full mb-4" />
            <div className="h-14 w-64 bg-white/5 rounded-xl mb-4" />
            <div className="h-5 w-96 bg-white/5 rounded-lg" />
          </div>
          <div className="h-10 w-36 bg-white/5 rounded-full mt-8 md:mt-0" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-8">
          <div className="h-[500px] bg-white/5 rounded-3xl lg:col-span-8" />
          <div className="h-[300px] bg-white/5 rounded-3xl lg:col-span-4" />
          <div className="h-[300px] bg-white/5 rounded-3xl lg:col-span-4" />
        </div>
      </div>
    </section>
  );

  return (
    <section id="case-studies" className="relative py-[var(--section-padding)] bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-block text-destructive text-sm font-semibold uppercase tracking-widest mb-4"
            >
              Our Work
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-white leading-tight"
            >
              Case <span className="bg-gradient-to-r from-destructive via-accent to-primary bg-clip-text text-transparent">Studies</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 mt-6 text-lg"
            >
              Real results from real collaborations. See how we've transformed businesses through strategic marketing and technical excellence.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <NeonButton
              variant="outline"
              className="mt-8 md:mt-0"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Full Portfolio
            </NeonButton>
          </motion.div>
        </div>

        {/* Case Studies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-8">
          <AnimatePresence>
            {caseStudies.map((study: any, index: number) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer bg-card border border-white/5 hover:border-primary/30 transition-all duration-500 ${index === 0 ? 'lg:col-span-8 lg:row-span-2' : 'lg:col-span-4'
                  }`}
                onMouseEnter={() => setHoveredId(study.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onViewCaseStudy(study.slug)}
              >
                {/* Image Container */}
                <div className={`relative w-full ${index === 0 ? 'h-[500px]' : 'h-[300px]'} overflow-hidden`}>
                  <motion.img
                    src={study.image}
                    alt={study.title}
                    className="w-full h-full object-cover"
                    animate={{ scale: hoveredId === study.id ? 1.05 : 1 }}
                    transition={{ duration: 0.8 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

                  {/* Category/Featured Badge */}
                  <div className="absolute top-6 left-6 flex gap-2">
                    {study.isFeatured && (
                      <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-primary text-black rounded-full">
                        Featured
                      </span>
                    )}
                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white backdrop-blur-md rounded-full border border-white/10">
                      {study.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-8 transform transition-transform duration-500">
                  <motion.p
                    initial={{ opacity: 0.8 }}
                    className="text-primary text-xs font-bold uppercase tracking-widest mb-3"
                  >
                    {study.client}
                  </motion.p>
                  <h3 className={`font-bold text-white mb-4 group-hover:text-primary transition-colors duration-300 ${index === 0 ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'
                    }`}>
                    {study.title}
                  </h3>

                  {/* Results Row */}
                  <div className="flex flex-wrap gap-4 mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {JSON.parse(study.results).map((result: string, i: number) => (
                      <div key={i} className="flex flex-col">
                        <span className="text-white font-bold text-lg">{result.split(' ')[0]}</span>
                        <span className="text-gray-500 text-[10px] uppercase tracking-wider">{result.split(' ').slice(1).join(' ')}</span>
                      </div>
                    ))}
                  </div>

                  {/* View Action */}
                  <div className="mt-8 flex items-center text-white text-sm font-bold group-hover:text-primary transition-colors duration-300">
                    <span className="relative">
                      Explore Case Study
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                    </span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
