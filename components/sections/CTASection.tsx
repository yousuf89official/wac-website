import React from 'react';
import NeonButton from '../ui/NeonButton';
import { useGlobalContent } from '@/hooks/useContent';

interface CTASectionProps {
  onCtaClick: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onCtaClick }) => {
  const { data } = useGlobalContent();
  const cta = (data?.sections as any)?.cta;

  return (
    <section className="relative py-[var(--section-padding)] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-destructive/20" />
      <div className="absolute inset-0 bg-background/90" />

      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(var(--primary-rgb),0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--primary-rgb),0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-primary text-sm font-medium">{cta?.badge || 'Limited Availability'}</span>
        </div>

        {/* Headline */}
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {cta?.headline?.split(' ').slice(0, 2).join(' ')} <span className="bg-gradient-to-r from-primary via-accent to-destructive bg-clip-text text-transparent">{cta?.headline?.split(' ').slice(2).join(' ')}</span>
        </h2>

        {/* Subheadline */}
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto italic font-light">
          {cta?.subheadline || cta?.description || "Stop competing. Start collaborating. Let's build something extraordinary together."}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <NeonButton variant="primary" size="lg" onClick={onCtaClick}>
            <span>Book a Strategy Call</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NeonButton>
          <NeonButton
            variant="outline"
            size="lg"
            onClick={() => document.getElementById('case-studies')?.scrollIntoView({ behavior: 'smooth' })}
          >
            See Our Results
          </NeonButton>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
