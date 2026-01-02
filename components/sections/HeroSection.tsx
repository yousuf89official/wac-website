import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import GlitchText from '../ui/GlitchText';
import NeonButton from '../ui/NeonButton';
import ParticleBackground from '../ui/ParticleBackground';
import { useGlobalContent } from '@/hooks/useContent';

interface HeroSectionProps {
  onCtaClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onCtaClick }) => {
  const { data, isLoading } = useGlobalContent();
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.9]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (isLoading || !data) return null;

  const { hero } = data.sections || {};
  const { brand, stats } = data;

  return (
    <section className="relative min-h-screen py-[var(--section-padding)] flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: y1, scale: 1.1 }}
      >
        <img
          src={brand?.heroImage || 'https://d64gsuwffb70l.cloudfront.net/69551394a301a2b0fa990131_1767183371983_6dd8540a.png'}
          alt="Digital network visualization"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </motion.div>

      {/* Particle Effect */}
      <ParticleBackground />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 z-10 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(var(--primary-rgb),0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--primary-rgb),0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-20 max-w-6xl mx-auto px-6 text-center"
      >
        {/* Badge */}
        {hero?.badge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-sm font-medium tracking-wide">{hero.badge}</span>
          </motion.div>
        )}

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
        >
          <GlitchText text={hero?.headline?.split(' ')[0] || "We Are"} className="block" />
          <span className="block bg-gradient-to-r from-primary via-accent to-destructive bg-clip-text text-transparent">
            {hero?.headline?.split(' ').slice(1).join(' ') || "Collaborative"}
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          {hero?.description || hero?.subheadline || "Where visionary brands and elite marketing minds unite to create unstoppable growth."}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <NeonButton variant="primary" size="lg" onClick={onCtaClick}>
            <span>Join the Movement</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NeonButton>
          <NeonButton variant="outline" size="lg" onClick={() => document.getElementById('case-studies')?.scrollIntoView({ behavior: 'smooth' })}>
            View Our Work
          </NeonButton>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats?.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              className="text-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 transition-all duration-300"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce"
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
