"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageHero from '@/components/shared/PageHero';
import NeonButton from '@/components/ui/NeonButton';
import { fadeInUp, staggerContainer, staggerItem, scaleOnHover, sectionViewport, sectionPadding, sectionMaxWidth, cardBase } from '@/lib/design-system';

interface Service {
    id: number;
    title: string;
    description: string;
    icon: string;
    packages: ServicePackage[];
}

interface ServicePackage {
    id: number;
    tier: string;
    price: string;
    features: string;
    isPopular: boolean;
}

interface CaseStudy {
    id: number;
    slug: string;
    title: string;
    description: string;
    image: string;
    results: string;
}

interface ServicesContentProps {
    services: Service[];
    caseStudies: CaseStudy[];
}

const iconMap: Record<string, React.ReactNode> = {
    strategy: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    ),
    performance: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    seo: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    content: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    ),
    social: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
};

function getIcon(iconName: string) {
    return iconMap[iconName] || iconMap.strategy;
}

export default function ServicesContent({ services, caseStudies }: ServicesContentProps) {
    const router = useRouter();

    const scrollToContact = () => {
        router.push('/#contact');
    };

    return (
        <>
            <PageHero
                title="Our Services"
                subtitle="What We Do"
                description="Full-spectrum digital marketing built to scale your business. From strategy to execution, we deliver measurable results."
            />

            {/* Services Grid */}
            <section className={sectionPadding}>
                <div className={sectionMaxWidth}>
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={sectionViewport}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {services.map((service) => (
                            <motion.div
                                key={service.id}
                                variants={staggerItem}
                                {...scaleOnHover}
                                className={`${cardBase} p-8 group relative overflow-hidden`}
                            >
                                {/* Hover gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative">
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                                        {getIcon(service.icon)}
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                                        {service.title}
                                    </h3>

                                    <p className="text-gray-400 leading-relaxed">
                                        {service.description}
                                    </p>

                                    {service.packages.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-white/5">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Available tiers</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {service.packages.map((pkg) => (
                                                    <span
                                                        key={pkg.id}
                                                        className={`text-xs px-2.5 py-1 rounded-full border ${
                                                            pkg.isPopular
                                                                ? 'border-primary/30 text-primary bg-primary/10'
                                                                : 'border-white/10 text-gray-400'
                                                        }`}
                                                    >
                                                        {pkg.tier}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Pricing Tables */}
            {services.some((s) => s.packages.length > 0) && (
                <section className={`${sectionPadding} bg-white/[0.02]`}>
                    <div className={sectionMaxWidth}>
                        <motion.div
                            {...fadeInUp}
                            viewport={sectionViewport}
                            className="text-center mb-16"
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">Pricing</p>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                                Transparent Pricing
                            </h2>
                            <p className="mt-4 text-gray-400 max-w-xl mx-auto">
                                Choose the tier that fits your stage. Scale up anytime.
                            </p>
                        </motion.div>

                        {services.filter((s) => s.packages.length > 0).map((service) => (
                            <div key={service.id} className="mb-20 last:mb-0">
                                <motion.h3
                                    {...fadeInUp}
                                    viewport={sectionViewport}
                                    className="text-2xl font-bold text-white mb-8 text-center"
                                >
                                    {service.title}
                                </motion.h3>

                                <motion.div
                                    variants={staggerContainer}
                                    initial="initial"
                                    whileInView="animate"
                                    viewport={sectionViewport}
                                    className="grid md:grid-cols-3 gap-6"
                                >
                                    {service.packages.map((pkg) => {
                                        let features: string[] = [];
                                        try { features = JSON.parse(pkg.features); } catch { /* empty */ }

                                        return (
                                            <motion.div
                                                key={pkg.id}
                                                variants={staggerItem}
                                                className={`${cardBase} p-8 relative ${
                                                    pkg.isPopular ? 'border-primary/40 shadow-[0_0_30px_rgba(0,240,255,0.1)]' : ''
                                                }`}
                                            >
                                                {pkg.isPopular && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-full uppercase tracking-wider">
                                                        Most Popular
                                                    </div>
                                                )}

                                                <div className="text-center mb-6">
                                                    <h4 className="text-lg font-bold text-white mb-2">{pkg.tier}</h4>
                                                    <p className="text-3xl font-black text-white">
                                                        {pkg.price}
                                                    </p>
                                                </div>

                                                <ul className="space-y-3 mb-8">
                                                    {features.map((feature, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                                            <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>

                                                <NeonButton
                                                    variant={pkg.isPopular ? "primary" : "ghost"}
                                                    className="w-full"
                                                    onClick={scrollToContact}
                                                >
                                                    Get Started
                                                </NeonButton>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Featured Case Studies */}
            {caseStudies.length > 0 && (
                <section className={sectionPadding}>
                    <div className={sectionMaxWidth}>
                        <motion.div
                            {...fadeInUp}
                            viewport={sectionViewport}
                            className="text-center mb-16"
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">Results</p>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                                Proven Track Record
                            </h2>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            whileInView="animate"
                            viewport={sectionViewport}
                            className="grid md:grid-cols-3 gap-8"
                        >
                            {caseStudies.map((study) => (
                                <motion.div
                                    key={study.id}
                                    variants={staggerItem}
                                    {...scaleOnHover}
                                    onClick={() => router.push(`/work/${study.slug}`)}
                                    className={`${cardBase} overflow-hidden cursor-pointer group`}
                                >
                                    {study.image && (
                                        <div className="aspect-video overflow-hidden">
                                            <img
                                                src={study.image}
                                                alt={study.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                            {study.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 line-clamp-2">
                                            {study.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            {...fadeInUp}
                            viewport={sectionViewport}
                            className="text-center mt-12"
                        >
                            <NeonButton variant="ghost" onClick={() => router.push('/#case-studies')}>
                                View All Work
                            </NeonButton>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className={`${sectionPadding} bg-white/[0.02]`}>
                <div className={`${sectionMaxWidth} text-center`}>
                    <motion.div {...fadeInUp} viewport={sectionViewport}>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6">
                            Ready to Scale?
                        </h2>
                        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
                            Book a free strategy call and let&apos;s map out your growth roadmap together.
                        </p>
                        <NeonButton variant="primary" size="lg" onClick={scrollToContact}>
                            Schedule a Strategy Call
                        </NeonButton>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
