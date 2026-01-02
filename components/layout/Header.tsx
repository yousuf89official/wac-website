import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalContent } from '@/hooks/useContent';
import NeonButton from '../ui/NeonButton';

import { useActiveSection } from '@/hooks/useActiveSection';

const Header: React.FC = () => {
  const { data, isLoading } = useGlobalContent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Extract section IDs for the hook
  const sectionIds = data?.navLinks?.map((link: any) => link.href.replace('#', '')) || [];
  const activeSection = useActiveSection(sectionIds);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading || !data) return null;

  const { navLinks, brand } = data;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-6 ${isScrolled ? 'bg-background/80 backdrop-blur-xl shadow-2xl py-4' : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="relative group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-destructive p-[2px]">
                <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center font-black text-white text-xl">
                  W
                </div>
              </div>
              <span className="text-white font-black text-xl tracking-tighter hidden sm:block">
                {brand?.name || 'WE ARE COLLABORATIVE'}
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks?.map((link: any) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.href)}
                  className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors relative group ${isActive ? 'text-primary' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-[1px] bg-primary transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </button>
              );
            })}
            <div className="h-6 w-[1px] bg-white/10" />
            <NeonButton variant="primary" size="sm" onClick={() => scrollToSection('#contact')}>
              Discuss Growth
            </NeonButton>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <motion.span
              animate={mobileMenuOpen ? { rotate: 45, y: 7.5 } : { rotate: 0, y: 0 }}
              className="w-8 h-[2px] bg-white rounded-full"
            />
            <motion.span
              animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-8 h-[2px] bg-white rounded-full"
            />
            <motion.span
              animate={mobileMenuOpen ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }}
              className="w-8 h-[2px] bg-white rounded-full"
            />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-background lg:hidden flex flex-col p-12"
          >
            <div className="flex justify-end mb-16">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {navLinks?.map((link: any, i: number) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => scrollToSection(link.href)}
                  className="text-4xl font-black text-left text-white tracking-tighter hover:text-primary transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}
            </div>

            <div className="mt-auto">
              <NeonButton variant="primary" className="w-full py-6" onClick={() => scrollToSection('#contact')}>
                Start Collaboration
              </NeonButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
