import React from 'react';
import { motion } from 'framer-motion';
import { useClients, useGlobalContent } from '@/hooks/useContent';

const ClientsSection: React.FC = () => {
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: globalData, isLoading: globalLoading } = useGlobalContent();

  const isLoading = clientsLoading || globalLoading;

  if (isLoading || !clients || clients.length === 0) return null;

  const stats = globalData?.stats || [];

  // Duplicate clients for infinite scroll
  const scrollingClients = [...clients, ...clients, ...clients];

  return (
    <section className="relative py-[var(--section-padding)] bg-background overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-widest mb-4"
          >
            Trusted Partnership
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white"
          >
            Empowering <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Visionary Brands</span>
          </motion.h2>
        </div>

        {/* Infinite Scroll Carousel */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

          <div className="flex overflow-hidden">
            <motion.div
              className="flex items-center gap-12 py-4"
              animate={{
                x: [0, -100 * clients.length],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: clients.length * 3,
                  ease: "linear",
                },
              }}
            >
              {scrollingClients.map((client: any, idx: number) => (
                <div
                  key={`${client.id}-${idx}`}
                  className="relative flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-500 cursor-pointer"
                >
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-primary font-medium tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {client.name}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Stats / Proof Line - Hardcoded as per original, or can be dynamic from STATS if needed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 text-center border-t border-white/5 pt-12"
        >
          {stats.slice(0, 3).map((stat: any, index: number) => (
            <div key={index}>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-500 text-xs uppercase tracking-widest font-medium">{stat.label}</div>
            </div>
          ))}
          {stats.length === 0 && (
            <>
              <div>
                <div className="text-2xl font-bold text-white mb-1">500+</div>
                <div className="text-gray-500 text-xs uppercase tracking-widest font-medium">Successful Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">98%</div>
                <div className="text-gray-500 text-xs uppercase tracking-widest font-medium">Client Retention</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">15+</div>
                <div className="text-gray-500 text-xs uppercase tracking-widest font-medium">Years Experience</div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ClientsSection;
