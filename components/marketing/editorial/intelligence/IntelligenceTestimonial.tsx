"use client";

import { motion } from "framer-motion";

export function IntelligenceTestimonial() {
    return (
        <section className="relative border-t border-foreground/10 py-30 md:py-40">
            <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="eyebrow mb-14 flex items-center gap-3"
                >
                    <span className="inline-block h-px w-10 bg-foreground-soft" />
                    <span>Words From Partners</span>
                </motion.p>

                <motion.blockquote
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    className="max-w-5xl"
                >
                    <span
                        aria-hidden
                        className="block font-display text-[8rem] leading-none text-primary md:text-[12rem]"
                        style={{
                            fontVariationSettings:
                                '"opsz" 144, "SOFT" 100, "WONK" 1',
                        }}
                    >
                        &ldquo;
                    </span>
                    <p
                        className="-mt-12 font-display text-3xl font-medium leading-[1.1] tracking-tight md:-mt-16 md:text-5xl"
                        style={{
                            fontVariationSettings: '"opsz" 144, "SOFT" 50, "WONK" 0',
                        }}
                    >
                        <span className="italic">
                            Collaborative Intelligence transformed how we track
                            campaign performance. We went from spreadsheets to
                            real-time intelligence in weeks.
                        </span>
                    </p>
                    <footer className="mt-12 flex items-baseline gap-4 border-t border-foreground/10 pt-6">
                        <p className="font-display text-lg">Sarah Chen</p>
                        <span className="text-foreground-soft/40">·</span>
                        <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            VP Marketing, Global Brands Inc.
                        </p>
                    </footer>
                </motion.blockquote>
            </div>
        </section>
    );
}
