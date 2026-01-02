import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubmitLead } from '@/hooks/useContent';
import NeonButton from '../ui/NeonButton';

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  leadType: string;
}

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    leadType: 'inquiry',
  });
  const [activeField, setActiveField] = useState<string | null>(null);

  const submitLead = useSubmitLead();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    submitLead.mutate({
      name: formData.name,
      email: formData.email,
      company: formData.company,
      message: formData.message,
      lead_type: formData.leadType,
    }, {
      onSuccess: () => {
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          message: '',
          leadType: 'inquiry',
        });
      }
    });
  };

  const contactInfo = [
    {
      label: 'Strategy & Growth',
      value: 'hello@wearecollaborative.net',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: '#00f0ff'
    },
    {
      label: 'Global Operations',
      value: 'Remote-First • Worldwide',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: '#b000ff'
    },
    {
      label: 'Fast-Track Response',
      value: '< 24 Hour Turnaround',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: '#ff006e'
    }
  ];

  return (
    <section id="contact" className="relative py-[var(--section-padding)] bg-[#0a0a0a] overflow-hidden">
      {/* Dynamic Background Noise/Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00f0ff] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#b000ff] rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-start">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-[#00f0ff] text-sm font-black uppercase tracking-[0.4em] mb-6"
            >
              Contact
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-black text-white leading-none tracking-tighter mb-10"
            >
              Let's Scale <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#b000ff] to-[#ff006e]">The Future.</span>
            </motion.h2>
            <p className="text-gray-400 text-xl mb-16 leading-relaxed max-w-lg">
              Unlock elite-level growth. Whether you're a brand seeking scale
              or an agency looking to collaborate, let's build the roadmap together.
            </p>

            {/* Contact Details Cards */}
            <div className="grid gap-6">
              {contactInfo.map((info, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="group flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-500"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                    style={{ backgroundColor: `${info.color}15`, color: info.color }}
                  >
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">{info.label}</p>
                    <p className="text-white text-lg font-bold group-hover:text-[#00f0ff] transition-colors">{info.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

          </motion.div>

          {/* Right Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            {/* Visual Frame */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00f0ff]/30 via-[#b000ff]/30 to-[#ff006e]/30 rounded-[3rem] blur-2xl opacity-20" />

            <div className="relative p-10 md:p-14 bg-[#111] rounded-[3rem] border border-white/10 overflow-hidden group">
              {/* Form Success State */}
              <AnimatePresence>
                {submitLead.isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                    animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/80 p-12 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                    >
                      <div className="w-24 h-24 rounded-full bg-[#00f0ff]/10 flex items-center justify-center mx-auto mb-8 border border-[#00f0ff]/30">
                        <svg className="w-12 h-12 text-[#00f0ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-4xl font-black text-white mb-4 leading-none">Transmission <br />Successful.</h3>
                      <p className="text-gray-400 text-lg mb-10">Strategy team will stabilize contact <br />within 24 standard hours.</p>
                      <NeonButton variant="outline" onClick={() => submitLead.reset()}>
                        Initiate New Link
                      </NeonButton>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <h3 className="text-2xl font-black text-white mb-10 tracking-tight">Initiate Collaboration</h3>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Interest Picker */}
                <div className="relative">
                  <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Objective</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Growth Inquiry', 'Strategic Meet', 'Affiliate Apply', 'Agency Partner'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, leadType: type.toLowerCase().replace(/\s/g, '') }))}
                        className={`px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${formData.leadType === type.toLowerCase().replace(/\s/g, '')
                          ? 'bg-[#00f0ff] border-[#00f0ff] text-black'
                          : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Identity *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onFocus={() => setActiveField('name')}
                      onBlur={() => setActiveField(null)}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-800 focus:border-[#00f0ff] focus:outline-none transition-all group-hover:border-white/20"
                      placeholder="Your Full Name"
                    />
                    <motion.div
                      animate={{ width: activeField === 'name' ? '100%' : '0%' }}
                      className="absolute bottom-0 left-0 h-[2px] bg-[#00f0ff]"
                    />
                  </div>
                  <div className="relative group">
                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Communication Channel *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onFocus={() => setActiveField('email')}
                      onBlur={() => setActiveField(null)}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-800 focus:border-[#00f0ff] focus:outline-none transition-all group-hover:border-white/20"
                      placeholder="you@corporate.com"
                    />
                    <motion.div
                      animate={{ width: activeField === 'email' ? '100%' : '0%' }}
                      className="absolute bottom-0 left-0 h-[2px] bg-[#00f0ff]"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Organization</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onFocus={() => setActiveField('company')}
                      onBlur={() => setActiveField(null)}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-800 focus:border-[#00f0ff] focus:outline-none transition-all group-hover:border-white/20"
                      placeholder="Brand Name"
                    />
                    <motion.div
                      animate={{ width: activeField === 'company' ? '100%' : '0%' }}
                      className="absolute bottom-0 left-0 h-[2px] bg-[#00f0ff]"
                    />
                  </div>
                  <div className="relative group">
                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Mobile Frequency</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onFocus={() => setActiveField('phone')}
                      onBlur={() => setActiveField(null)}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-800 focus:border-[#00f0ff] focus:outline-none transition-all group-hover:border-white/20"
                      placeholder="+1 (000) 000-0000"
                    />
                    <motion.div
                      animate={{ width: activeField === 'phone' ? '100%' : '0%' }}
                      className="absolute bottom-0 left-0 h-[2px] bg-[#00f0ff]"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Mission Brief *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onFocus={() => setActiveField('message')}
                    onBlur={() => setActiveField(null)}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-800 focus:border-[#00f0ff] focus:outline-none transition-all resize-none group-hover:border-white/20"
                    placeholder="Briefly describe your vision or requirements..."
                  />
                  <motion.div
                    animate={{ width: activeField === 'message' ? '100%' : '0%' }}
                    className="absolute bottom-2 left-0 h-[2px] bg-[#00f0ff]"
                  />
                </div>

                {submitLead.isError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest text-center"
                  >
                    Transmission Interrupted. Retry.
                  </motion.div>
                )}

                <NeonButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full h-16 rounded-2xl text-lg group/btn"
                  disabled={submitLead.isPending}
                >
                  {submitLead.isPending ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Encrypting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      Deploy Mission
                      <svg className="w-5 h-5 transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  )}
                </NeonButton>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
