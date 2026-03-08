import React from 'react';
import { useGlobalContent } from '@/hooks/useContent';

const ProcessSection: React.FC = () => {
  const { data, isLoading } = useGlobalContent();
  const steps = data?.processSteps || [];
  const process = data?.sections?.process;

  if (isLoading) return (
    <section className="relative py-[var(--section-padding)] bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-6 animate-pulse">
        <div className="text-center mb-16">
          <div className="h-3 w-24 bg-white/5 rounded-full mx-auto mb-4" />
          <div className="h-10 w-64 bg-white/5 rounded-xl mx-auto mb-4" />
          <div className="h-5 w-80 bg-white/5 rounded-lg mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    </section>
  );
  if (steps.length === 0) return null;

  return (
    <section className="relative py-[var(--section-padding)] bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-destructive text-sm font-semibold uppercase tracking-widest">{process?.badge || "Our Process"}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            {process?.headline?.split(' ').slice(0, 2).join(' ')} <span className="bg-gradient-to-r from-destructive via-accent to-primary bg-clip-text text-transparent">{process?.headline?.split(' ').slice(2).join(' ')}</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            {process?.description || "A proven framework that transforms ambitious goals into measurable results."}
          </p>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-destructive/20 -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step: any, index: number) => (
              <div key={index} className="relative group">
                {/* Step Card */}
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 hover:border-white/10 transition-all duration-500">
                  {/* Number */}
                  <div
                    className="text-6xl font-bold mb-6 opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                    style={{ color: step.color || 'var(--primary)' }}
                  >
                    {step.number || `0${index + 1}`}
                  </div>

                  {/* Dot indicator */}
                  <div
                    className="absolute top-8 right-8 w-3 h-3 rounded-full"
                    style={{ backgroundColor: step.color || 'var(--primary)' }}
                  />

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow (hidden on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 items-center justify-center text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
