"use client";

import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/design-system';

interface PageHeroProps {
    title: string;
    subtitle?: string;
    description?: string;
}

export default function PageHero({ title, subtitle, description }: PageHeroProps) {
    return (
        <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 text-center">
                {subtitle && (
                    <motion.p
                        {...fadeInUp}
                        className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-6"
                    >
                        {subtitle}
                    </motion.p>
                )}

                <motion.h1
                    {...fadeInUp}
                    transition={{ ...fadeInUp.transition, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6"
                >
                    {title}
                </motion.h1>

                {description && (
                    <motion.p
                        {...fadeInUp}
                        transition={{ ...fadeInUp.transition, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto"
                    >
                        {description}
                    </motion.p>
                )}

                {/* Decorative gradient line */}
                <motion.div
                    {...fadeInUp}
                    transition={{ ...fadeInUp.transition, delay: 0.3 }}
                    className="mt-12 mx-auto w-24 h-[2px] bg-gradient-to-r from-primary via-accent to-destructive"
                />
            </div>
        </section>
    );
}
