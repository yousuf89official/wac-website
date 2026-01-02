import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubmitLead } from '@/hooks/useContent';
import NeonButton from '../ui/NeonButton';

const AffiliateSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    audience: '',
  });

  const submitLead = useSubmitLead();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    submitLead.mutate({
      name: formData.name,
      email: formData.email,
      message: `Website: ${formData.website}\nAudience: ${formData.audience}`,
      lead_type: 'affiliate',
    });
  };

  const benefits = [
    {
      title: '30% Lifetime Commission',
      description: 'Earn generous recursive commissions on every referral that converts to a long-term contract.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'White-Label Assets',
      description: 'Access premium marketing materials, pitch decks, and case studies to close deals faster.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: 'Growth Mentorship',
      description: 'Direct access to our strategy team to help you scale your own affiliate business.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: 'Precision Tracking',
      description: 'A custom dashboard to monitor your impact, conversions, and revenue in real-time.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="affiliate" className="relative py-[var(--section-padding)] bg-background overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-full h-[500px] bg-gradient-to-r from-primary/5 via-transparent to-accent/5 blur-[120px] -translate-y-1/2 opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 lg:gap-32 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em] mb-6"
            >
              The Partnership Program
            </motion.span>
            <motion.h2
              className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none"
            >
              Scale Your Revenue <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-destructive">
                By Collaborating
              </span>
            </motion.h2>
            <p className="text-gray-400 text-xl mb-12 leading-relaxed max-w-xl">
              Don't just refer — partner. Our affiliate ecosystem is designed for
              high-impact creators and consultants who want to align with the
              world's leading performance network.
            </p>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-black transition-all duration-500">
                    {benefit.icon}
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2 group-hover:text-primary transition-colors">{benefit.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Visual Backglow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />

            <div className="relative p-10 md:p-14 rounded-[2.5rem] bg-[#111] border border-white/5">
              <AnimatePresence mode="wait">
                {submitLead.isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/20">
                      <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4">Application Sent</h3>
                    <p className="text-gray-400 text-lg">Our partnership team will review your profile and reach out within 48 hours to discuss the next steps.</p>
                    <NeonButton variant="outline" className="mt-8" onClick={() => submitLead.reset()}>New Application</NeonButton>
                  </motion.div>
                ) : (
                  <motion.div
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <h3 className="text-2xl font-black text-white mb-8">Join the Network</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Full Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:border-primary focus:outline-none transition-all"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Professional Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:border-primary focus:outline-none transition-all"
                            placeholder="john@agency.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Primary Platform / Website</label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:border-primary focus:outline-none transition-all"
                          placeholder="https://yourplatform.com"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Audience Insights</label>
                        <textarea
                          value={formData.audience}
                          onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                          rows={4}
                          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:border-primary focus:outline-none resize-none transition-all"
                          placeholder="Describe your audience demographics and estimated reach..."
                        />
                      </div>
                      <NeonButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={submitLead.isPending}
                      >
                        {submitLead.isPending ? 'Processing...' : 'Apply for Affiliate Status'}
                      </NeonButton>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AffiliateSection;
