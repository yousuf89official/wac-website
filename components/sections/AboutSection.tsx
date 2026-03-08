import React from 'react';
import { motion } from 'framer-motion';
import { useGlobalContent } from '@/hooks/useContent';

const ValueIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'collaboration':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'results':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'transparency':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    case 'partnership':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.757a2 2 0 110 4H14v5h-4v-5H5.243a2 2 0 110-4H10V5h4v5z" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
  }
};

const AboutSection: React.FC = () => {
  const { data, isLoading } = useGlobalContent();

  if (isLoading || !data) return (
    <section className="relative py-[var(--section-padding)] bg-background">
      <div className="max-w-7xl mx-auto px-6 animate-pulse">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="h-3 w-24 bg-white/5 rounded-full mb-4" />
            <div className="h-14 w-4/5 bg-white/5 rounded-xl mb-4" />
            <div className="h-14 w-3/5 bg-white/5 rounded-xl mb-8" />
            <div className="h-5 w-full bg-white/5 rounded-lg mb-2" />
            <div className="h-5 w-5/6 bg-white/5 rounded-lg mb-2" />
            <div className="h-5 w-4/6 bg-white/5 rounded-lg mb-10" />
            <div className="grid sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
            </div>
          </div>
          <div className="aspect-square bg-white/5 rounded-[3rem]" />
        </div>
      </div>
    </section>
  );

  const { values, sections } = data;
  const about = sections?.about;

  return (
    <section id="about" className="relative py-[var(--section-padding)] bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Left */}
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-primary text-sm font-bold uppercase tracking-widest mb-4 inline-block"
            >
              {about?.badge || "Who We Are"}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight"
            >
              {about?.headline?.split(' ').slice(0, 2).join(' ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{about?.headline?.split(' ').slice(2).join(' ')}</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-lg mb-12 leading-relaxed"
            >
              {about?.description || "We are a network of elite marketing specialists, strategists, and creative minds who believe that the old agency model is broken. We've built a high-performance ecosystem where collaboration drives explosive growth for visionary brands."}
            </motion.p>

            {/* Values Sub-grid */}
            <div className="grid sm:grid-cols-2 gap-8">
              {values?.map((val: any, index: number) => (
                <motion.div
                  key={val.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-300">
                      <ValueIcon type={val.icon} />
                    </div>
                    <h4 className="text-white font-bold text-lg">{val.title}</h4>
                  </div>
                  <p className="text-gray-500 text-sm">{val.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Visual Right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-square rounded-[3rem] overflow-hidden relative z-10">
              <img
                src="https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183371983_6dd8540a.png"
                alt="Collective collaboration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20" />
            </div>

            {/* Floating Accents */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 blur-3xl rounded-full z-0"
            />
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full z-0"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
