import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalContent } from '@/hooks/useContent';

const TestimonialsSection: React.FC = () => {
  const { data, isLoading } = useGlobalContent();
  const testimonials = data?.testimonials || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      paginate(1);
    }, 8000);
    return () => clearInterval(interval);
  }, [activeIndex, testimonials.length]);

  const paginate = (newDirection: number) => {
    if (testimonials.length === 0) return;
    setDirection(newDirection);
    setActiveIndex((prev) => (prev + newDirection + testimonials.length) % testimonials.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    }),
  };

  if (isLoading) return (
    <section className="relative py-[var(--section-padding)] bg-background">
      <div className="max-w-6xl mx-auto px-6 animate-pulse">
        <div className="text-center mb-20">
          <div className="h-3 w-28 bg-white/5 rounded-full mx-auto mb-4" />
          <div className="h-14 w-96 bg-white/5 rounded-xl mx-auto" />
        </div>
        <div className="h-[500px] bg-white/5 rounded-[2.5rem]" />
      </div>
    </section>
  );
  if (testimonials.length === 0) return null;

  return (
    <section className="relative py-[var(--section-padding)] bg-background overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl rounded-full bg-gradient-to-r from-primary/5 via-transparent to-accent/5 blur-3xl opacity-50" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 text-balance">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary text-sm font-bold uppercase tracking-[0.2em]"
          >
            Success Stories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mt-6 mb-8 leading-tight"
          >
            Inside the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-destructive">Collaboration</span>
          </motion.h2>
        </div>

        {/* Testimonial Display Area */}
        <div className="relative min-h-[500px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 },
              }}
              className="w-full"
            >
              <div className="bg-[#141414] rounded-[2.5rem] p-8 md:p-16 border border-white/5 relative overflow-hidden group">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent opacity-30 blur-2xl group-hover:opacity-50 transition-opacity duration-700" />

                <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
                  {/* Persona Section */}
                  <div className="relative group/persona">
                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-3xl overflow-hidden border border-white/10 p-2 bg-gradient-to-br from-white/10 to-transparent">
                      <img
                        src={testimonials[activeIndex].image}
                        alt={testimonials[activeIndex].author}
                        className="w-full h-full object-cover rounded-2xl grayscale group-hover/persona:grayscale-0 transition-all duration-700 ease-out"
                      />
                    </div>
                    {/* Floating Result Tag */}
                    <div className="absolute -bottom-4 -right-4 px-6 py-3 bg-[#111] border border-primary/30 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                      <p className="text-primary text-lg font-black tracking-tighter">
                        {testimonials[activeIndex].results.split(' ')[0]}
                      </p>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none mt-1">
                        {testimonials[activeIndex].results.split(' ').slice(1).join(' ')}
                      </p>
                    </div>
                  </div>

                  {/* Message Section */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="mb-8">
                      <svg className="w-16 h-16 text-primary opacity-10 mb-[-1.5rem] mx-auto lg:mx-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="text-xl md:text-3xl font-medium text-white italic leading-[1.6] md:leading-[1.4] tracking-tight">
                        "{testimonials[activeIndex].quote}"
                      </p>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-t border-white/5 pt-8">
                      <div>
                        <h4 className="text-white font-black text-2xl tracking-tight">{testimonials[activeIndex].author}</h4>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs mt-1">
                          {testimonials[activeIndex].role} <span className="mx-2 text-accent/50">•</span> <span className="text-primary">{testimonials[activeIndex].company}</span>
                        </p>
                      </div>

                      {/* Nav Controls Overlay */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => paginate(-1)}
                          className="p-4 rounded-2xl border border-white/10 text-white hover:bg-white/5 hover:border-primary/50 transition-all duration-300 group/btn"
                        >
                          <svg className="w-6 h-6 transform group-hover/btn:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => paginate(1)}
                          className="p-4 rounded-2xl border border-white/10 text-white hover:bg-white/5 hover:border-destructive/50 transition-all duration-300 group/btn"
                        >
                          <svg className="w-6 h-6 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="mt-12 flex justify-center gap-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > activeIndex ? 1 : -1);
                setActiveIndex(index);
              }}
              className={`h-1 rounded-full transition-all duration-500 ${index === activeIndex
                ? 'bg-gradient-to-r from-primary to-accent w-12'
                : 'bg-white/10 w-4 hover:bg-white/20'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
