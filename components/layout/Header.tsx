import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalContent } from '@/hooks/useContent';
import { useActiveSection } from '@/hooks/useActiveSection';
import { routing } from '@/lib/i18n/routing';
import { useLenis } from 'lenis/react';

// ─── Animation Variants ───────────────────────────────────────
// Clip-path reveal: the menu "unrolls" from the top like a curtain
const overlayVariants = {
  closed: {
    clipPath: 'inset(0 0 100% 0)',
    transition: {
      duration: 0.6,
      ease: [0.76, 0, 0.24, 1] as const,
    },
  },
  open: {
    clipPath: 'inset(0 0 0% 0)',
    transition: {
      duration: 0.8,
      ease: [0.76, 0, 0.24, 1] as const,
      staggerChildren: 0.035,
      delayChildren: 0.3,
    },
  },
};

// Each menu item slides up and fades in
const itemVariants = {
  closed: {
    opacity: 0,
    y: 30,
    transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] as const },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ─── Sub-components ───────────────────────────────────────────

/** Large numbered links for the main navigation column */
function MegaLink({
  index,
  label,
  onClick,
}: {
  index: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      variants={itemVariants}
      onClick={onClick}
      className="group flex items-center gap-5 py-3 text-left w-full"
    >
      <span className="text-white/20 text-xs font-mono tabular-nums min-w-[24px]">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span
        className="text-4xl lg:text-5xl xl:text-6xl font-medium text-white tracking-tight
                   transition-all duration-300 ease-out
                   group-hover:text-white/50 group-hover:translate-x-3"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {label}
      </span>
      {/* Hover arrow */}
      <svg
        className="w-6 h-6 text-white/0 group-hover:text-white/40 -translate-x-4 group-hover:translate-x-0
                   transition-all duration-300 ease-out"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
      </svg>
    </motion.button>
  );
}

/** Smaller dot-prefixed links for secondary columns */
function SmallLink({
  label,
  onClick,
  badge,
}: {
  label: string;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <motion.button
      variants={itemVariants}
      onClick={onClick}
      className="group flex items-center gap-3 py-2.5 text-left w-full"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white group-hover:shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-300" />
      <span
        className="text-lg text-white/60 font-medium tracking-tight
                   transition-all duration-300 ease-out
                   group-hover:text-white group-hover:translate-x-1"
      >
        {label}
      </span>
      {badge && (
        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold text-white/50 uppercase tracking-wider">
          {badge}
        </span>
      )}
    </motion.button>
  );
}

/** Column header label */
function ColumnLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      variants={itemVariants}
      className="text-white/30 text-[11px] font-semibold uppercase tracking-[0.25em] mb-8"
    >
      {children}
    </motion.p>
  );
}

// ─── Main Header Component ────────────────────────────────────

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('nav');
  const { data, isLoading } = useGlobalContent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lenis = useLenis();

  const isHomepage = pathname === '/';

  const sectionIds = isHomepage
    ? (data?.navLinks
        ?.filter((link: any) => link.href.startsWith('#'))
        .map((link: any) => link.href.replace('#', '')) || [])
    : [];
  const activeSection = useActiveSection(sectionIds);

  // Track scroll position for header background
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock/unlock Lenis scroll when mega menu toggles
  useEffect(() => {
    if (menuOpen) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
  }, [menuOpen, lenis]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (isLoading || !data) return null;

  const { navLinks, brand } = data;

  const isHashLink = (href: string) => href.startsWith('#');

  // Use Lenis scrollTo for smooth, physics-based scroll
  const handleNavClick = (href: string) => {
    if (isHashLink(href)) {
      if (isHomepage) {
        const el = document.getElementById(href.replace('#', ''));
        if (el) lenis?.scrollTo(el, { offset: -100 });
      } else {
        router.push('/' + href);
      }
    } else {
      router.push(href);
    }
    setMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (isHomepage) {
      lenis?.scrollTo(0);
    } else {
      router.push('/');
    }
    setMenuOpen(false);
  };

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  // Static mega menu sections
  const portalLinks = [
    { label: t('dashboard'), href: '/dashboard' },
    { label: 'Courses', href: '/dashboard/courses' },
    { label: 'Orders', href: '/dashboard/orders' },
    { label: 'Community', href: '/dashboard/community' },
  ];

  const connectLinks = [
    { label: t('login'), href: '/login' },
    { label: t('register'), href: '/register' },
  ];

  return (
    <>
      {/* ─── Top Bar ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-[110] transition-all duration-500 ${
          isScrolled && !menuOpen
            ? 'bg-black/60 backdrop-blur-2xl'
            : 'bg-transparent'
        }`}
      >
        <div className="flex items-center justify-between px-5 lg:px-10 h-16 lg:h-20">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="relative flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center font-bold text-black text-sm">
              W
            </div>
            <span
              className="text-white font-medium text-sm tracking-tight hidden sm:block
                         transition-opacity duration-300 group-hover:opacity-60"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {brand?.name || 'We Are Collaborative'}
            </span>
          </button>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            {/* Locale switcher (desktop) */}
            <div className="hidden md:flex items-center rounded-full border border-white/[0.08] overflow-hidden">
              {routing.locales.map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className={`px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-widest transition-all duration-300 ${
                    locale === l
                      ? 'bg-white text-black'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* CTA pill (desktop) */}
            <button
              onClick={() => handleNavClick('/#contact')}
              className="hidden md:flex items-center px-5 py-2 rounded-full bg-white text-black
                         text-xs font-semibold tracking-wide
                         hover:bg-white/90 active:scale-95 transition-all duration-200"
            >
              {t('discussGrowth')}
            </button>

            {/* Menu toggle pill */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 px-5 py-2 rounded-full
                         border border-white/[0.08] text-white
                         text-xs font-semibold tracking-wide
                         hover:bg-white/[0.04] active:scale-95 transition-all duration-200"
            >
              <span className="hidden sm:inline">
                {menuOpen ? 'Close' : 'Menu'}
              </span>
              {/* Animated hamburger → X */}
              <div className="relative w-4 h-3.5 flex flex-col items-center justify-center">
                <motion.span
                  animate={
                    menuOpen
                      ? { rotate: 45, y: 0, width: 16 }
                      : { rotate: 0, y: -4, width: 16 }
                  }
                  transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
                  className="absolute h-[1.5px] bg-white rounded-full"
                />
                <motion.span
                  animate={
                    menuOpen
                      ? { opacity: 0, scaleX: 0 }
                      : { opacity: 1, scaleX: 1 }
                  }
                  transition={{ duration: 0.2 }}
                  className="absolute w-4 h-[1.5px] bg-white rounded-full"
                />
                <motion.span
                  animate={
                    menuOpen
                      ? { rotate: -45, y: 0, width: 16 }
                      : { rotate: 0, y: 4, width: 16 }
                  }
                  transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
                  className="absolute h-[1.5px] bg-white rounded-full"
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mega Menu Overlay ─── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mega-menu"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-[100] bg-[#0a0a0a] overflow-y-auto overscroll-contain"
          >
            {/* Top spacer matching header height */}
            <div className="h-16 lg:h-20" />

            {/* Menu grid */}
            <div className="px-5 lg:px-10 pt-8 pb-12 lg:pt-16 lg:pb-20">
              <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6">

                  {/* ── Column 1: Main navigation (big links) ── */}
                  <div className="lg:col-span-6">
                    <ColumnLabel>Navigate</ColumnLabel>
                    <div className="flex flex-col">
                      {navLinks?.map((link: any, i: number) => (
                        <MegaLink
                          key={link.id}
                          index={i}
                          label={link.label}
                          onClick={() => handleNavClick(link.href)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ── Column 2: Portal links ── */}
                  <div className="lg:col-span-3 lg:col-start-8">
                    <ColumnLabel>Portal</ColumnLabel>
                    <div className="flex flex-col">
                      {portalLinks.map((link) => (
                        <SmallLink
                          key={link.href}
                          label={link.label}
                          onClick={() => handleNavClick(link.href)}
                        />
                      ))}
                    </div>

                    {/* Connect sub-section */}
                    <div className="mt-10">
                      <ColumnLabel>Connect</ColumnLabel>
                      <div className="flex flex-col">
                        {connectLinks.map((link) => (
                          <SmallLink
                            key={link.href}
                            label={link.label}
                            onClick={() => handleNavClick(link.href)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── Column 3: Info / social ── */}
                  <div className="lg:col-span-2 lg:col-start-11">
                    <ColumnLabel>Social</ColumnLabel>
                    <div className="flex flex-col gap-1">
                      {['Instagram', 'LinkedIn', 'Twitter'].map((name) => (
                        <motion.a
                          key={name}
                          variants={itemVariants}
                          href="#"
                          className="text-sm text-white/40 hover:text-white transition-colors duration-300 py-1.5"
                        >
                          {name}
                        </motion.a>
                      ))}
                    </div>

                    {/* Mobile locale switcher */}
                    <motion.div
                      variants={itemVariants}
                      className="mt-10 md:hidden"
                    >
                      <ColumnLabel>Language</ColumnLabel>
                      <div className="flex items-center rounded-full border border-white/[0.08] overflow-hidden w-fit">
                        {routing.locales.map((l) => (
                          <button
                            key={l}
                            onClick={() => switchLocale(l)}
                            className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-300 ${
                              locale === l
                                ? 'bg-white text-black'
                                : 'text-white/40 hover:text-white/80'
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* ── Bottom bar ── */}
                <motion.div
                  variants={itemVariants}
                  className="mt-16 lg:mt-24 pt-8 border-t border-white/[0.06]
                             flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                >
                  <p className="text-white/25 text-xs tracking-wide">
                    &copy; {new Date().getFullYear()} {brand?.name || 'We Are Collaborative'}. All rights reserved.
                  </p>
                  <button
                    onClick={() => handleNavClick('/#contact')}
                    className="px-7 py-3 rounded-full bg-white text-black
                               text-sm font-semibold tracking-wide
                               hover:bg-white/90 active:scale-95 transition-all duration-200"
                  >
                    {t('startCollaboration')}
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
