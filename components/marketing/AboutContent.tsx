"use client";

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PageHero from '@/components/shared/PageHero';
import NeonButton from '@/components/ui/NeonButton';
import { fadeInUp, staggerContainer, staggerItem, scaleOnHover, sectionViewport, sectionPadding, sectionMaxWidth, cardBase } from '@/lib/design-system';

interface Brand {
    name: string;
    tagline: string;
}

interface Value {
    id: number;
    title: string;
    description: string;
    icon: string;
}

interface ProcessStep {
    id: number;
    number: string;
    title: string;
    description: string;
    color: string;
}

interface Stat {
    id: number;
    value: string;
    label: string;
}

interface AboutContentProps {
    brand: Brand | null;
    values: Value[];
    processSteps: ProcessStep[];
    stats: Stat[];
}

function AnimatedCounter({ value }: { value: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const numericMatch = value.match(/^(\d+)/);

    if (!numericMatch) {
        return <span>{value}</span>;
    }

    const target = parseInt(numericMatch[1], 10);
    const suffix = value.replace(/^\d+/, '');
    const count = useMotionValue(0);
    const rounded = useTransform(count, (v) => Math.round(v));

    useEffect(() => {
        const controls = animate(count, target, { duration: 2, ease: "easeOut" });
        return controls.stop;
    }, [count, target]);

    useEffect(() => {
        const unsubscribe = rounded.on("change", (v) => {
            if (ref.current) ref.current.textContent = `${v}${suffix}`;
        });
        return unsubscribe;
    }, [rounded, suffix]);

    return <span ref={ref}>0{suffix}</span>;
}

const valueIconMap: Record<string, React.ReactNode> = {
    target: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    lightning: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    chart: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    handshake: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
};

function getValueIcon(icon: string) {
    return valueIconMap[icon] || valueIconMap.target;
}

export default function AboutContent({ brand, values, processSteps, stats }: AboutContentProps) {
    const router = useRouter();

    return (
        <>
            <PageHero
                title="We Are Collaborative"
                subtitle="Our Story"
                description={brand?.tagline || "A results-driven digital marketing agency helping brands grow through strategy, creativity, and data."}
            />

            {/* Mission Section */}
            <section className={sectionPadding}>
                <div className={`${sectionMaxWidth} max-w-4xl`}>
                    <motion.div {...fadeInUp} viewport={sectionViewport} className="text-center">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-8">
                            Built for the brands that{' '}
                            <span className="bg-gradient-to-r from-[#00f0ff] via-[#b000ff] to-[#ff006e] bg-clip-text text-transparent">
                                refuse to blend in
                            </span>
                        </h2>
                        <p className="text-lg text-gray-400 leading-relaxed mb-6">
                            We Are Collaborative was founded on a simple idea: great marketing happens when strategy meets creativity meets relentless execution. We don&apos;t just run campaigns &mdash; we build growth systems that compound over time.
                        </p>
                        <p className="text-lg text-gray-400 leading-relaxed">
                            Our team blends data-driven performance marketing with bold creative thinking. No templates. No generic playbooks. Every engagement is custom-built around your goals, your audience, and your market position.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            {stats.length > 0 && (
                <section className={`${sectionPadding} bg-white/[0.02]`}>
                    <div className={sectionMaxWidth}>
                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            whileInView="animate"
                            viewport={sectionViewport}
                            className="grid grid-cols-2 md:grid-cols-4 gap-8"
                        >
                            {stats.map((stat) => (
                                <motion.div
                                    key={stat.id}
                                    variants={staggerItem}
                                    className="text-center"
                                >
                                    <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#00f0ff] to-[#b000ff] bg-clip-text text-transparent mb-2">
                                        <AnimatedCounter value={stat.value} />
                                    </p>
                                    <p className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Values Grid */}
            {values.length > 0 && (
                <section className={sectionPadding}>
                    <div className={sectionMaxWidth}>
                        <motion.div
                            {...fadeInUp}
                            viewport={sectionViewport}
                            className="text-center mb-16"
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">Our Values</p>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                                What Drives Us
                            </h2>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            whileInView="animate"
                            viewport={sectionViewport}
                            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {values.map((value) => (
                                <motion.div
                                    key={value.id}
                                    variants={staggerItem}
                                    {...scaleOnHover}
                                    className={`${cardBase} p-6 text-center group`}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        {getValueIcon(value.icon)}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                                    <p className="text-sm text-gray-400">{value.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Process Timeline */}
            {processSteps.length > 0 && (
                <section className={`${sectionPadding} bg-white/[0.02]`}>
                    <div className={sectionMaxWidth}>
                        <motion.div
                            {...fadeInUp}
                            viewport={sectionViewport}
                            className="text-center mb-16"
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">Our Process</p>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                                How We Work
                            </h2>
                        </motion.div>

                        <div className="relative">
                            {/* Vertical timeline line */}
                            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-accent/50 to-destructive/50 hidden md:block" />

                            <div className="space-y-12">
                                {processSteps.map((step, i) => (
                                    <motion.div
                                        key={step.id}
                                        {...fadeInUp}
                                        transition={{ ...fadeInUp.transition, delay: i * 0.15 }}
                                        viewport={sectionViewport}
                                        className={`flex items-start gap-8 ${
                                            i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                        }`}
                                    >
                                        <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                                            <div className={`${cardBase} p-6 inline-block`}>
                                                <div
                                                    className="text-xs font-bold uppercase tracking-wider mb-2"
                                                    style={{ color: step.color }}
                                                >
                                                    Step {step.number}
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                                <p className="text-sm text-gray-400">{step.description}</p>
                                            </div>
                                        </div>

                                        {/* Center dot */}
                                        <div className="hidden md:flex items-center justify-center w-12 shrink-0">
                                            <div
                                                className="w-4 h-4 rounded-full border-2"
                                                style={{ borderColor: step.color, backgroundColor: `${step.color}33` }}
                                            />
                                        </div>

                                        <div className="flex-1 hidden md:block" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className={sectionPadding}>
                <div className={`${sectionMaxWidth} text-center`}>
                    <motion.div {...fadeInUp} viewport={sectionViewport}>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6">
                            Let&apos;s Build Together
                        </h2>
                        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
                            Ready to turn strategy into results? Let&apos;s talk about what we can build for your brand.
                        </p>
                        <NeonButton variant="primary" size="lg" onClick={() => router.push('/#contact')}>
                            Start a Conversation
                        </NeonButton>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
