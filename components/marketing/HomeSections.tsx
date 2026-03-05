"use client";

import { useRouter } from 'next/navigation';
import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import ClientsSection from '@/components/sections/ClientsSection';
import CaseStudiesSection from '@/components/sections/CaseStudiesSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import AboutSection from '@/components/sections/AboutSection';
import BlogSection from '@/components/sections/BlogSection';
import CTASection from '@/components/sections/CTASection';
import ContactSection from '@/components/sections/ContactSection';
import ProcessSection from '@/components/sections/ProcessSection';
import AffiliateSection from '@/components/sections/AffiliateSection';

export default function HomeSections() {
    const router = useRouter();

    const scrollToContact = () => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <HeroSection onCtaClick={scrollToContact} />
            <ClientsSection />
            <ServicesSection />
            <ProcessSection />
            <CaseStudiesSection onViewCaseStudy={(slug) => router.push(`/work/${slug}`)} />
            <TestimonialsSection />
            <AboutSection />
            <AffiliateSection />
            <BlogSection onViewPost={(slug) => router.push(`/resources/${slug}`)} />
            <CTASection onCtaClick={scrollToContact} />
            <ContactSection />
        </>
    );
}
