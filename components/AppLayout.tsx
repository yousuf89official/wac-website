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
