"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from './layout/Header';
import Footer from './layout/Footer';
import HeroSection from './sections/HeroSection';
import ServicesSection from './sections/ServicesSection';
import ClientsSection from './sections/ClientsSection';
import CaseStudiesSection from './sections/CaseStudiesSection';
import TestimonialsSection from './sections/TestimonialsSection';
import AboutSection from './sections/AboutSection';
import BlogSection from './sections/BlogSection';
import CTASection from './sections/CTASection';
import ContactSection from './sections/ContactSection';
import ProcessSection from './sections/ProcessSection';
import AffiliateSection from './sections/AffiliateSection';
import ChatWidget from './chat/ChatWidget';
import NewsletterPopup from './marketing/NewsletterPopup';

const AppLayout: React.FC = () => {
  const router = useRouter();

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {process.env.NEXT_PUBLIC_STAGING === 'true' && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-black text-[10px] font-bold py-1 text-center uppercase tracking-widest shadow-lg">
          Staging Environment - Internal Use Only
        </div>
      )}
      <Header />

      <main>
        <HeroSection onCtaClick={scrollToContact} />
        <ClientsSection />
        <ServicesSection />
        <ProcessSection />
        <CaseStudiesSection onViewCaseStudy={(slug) => router.push(`/work/${slug}`)} />
        <TestimonialsSection />
        <AboutSection />
        <AffiliateSection />
        <BlogSection onViewPost={(slug) => router.push(`/blog/${slug}`)} />
        <CTASection onCtaClick={scrollToContact} />
        <ContactSection />
      </main>

      <Footer onAdminClick={() => router.push('/admin')} />
      <ChatWidget />
      <NewsletterPopup />
    </div>
  );
};

export default AppLayout;
