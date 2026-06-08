"use client";

import { motion } from "framer-motion";

/**
 * Manifesto — short editorial essay.
 * 2-column layout on desktop, drop cap on the first paragraph.
 * Scroll-revealed with a stagger to feel like a magazine spread loading.
 */
export function ManifestoSection() {
    const ease = [0.16, 1, 0.3, 1] as const;

    return (
        <section id="manifesto" className="relative border-t border-foreground/10 py-30 md:py-40">
            <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, ease }}
                    className="eyebrow mb-10 flex items-center gap-3"
                >
                    <span className="inline-block h-px w-10 bg-foreground-soft" />
                    <span>The Manifesto</span>
                </motion.p>

                <div className="grid grid-cols-12 gap-x-6 gap-y-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 1, ease, delay: 0.05 }}
                        className="col-span-12 font-display text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-[0.95] tracking-tight md:col-span-7"
                    >
                        Built for the brands that{" "}
                        <span className="italic" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}>
                            refuse
                        </span>{" "}
                        to blend in.
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 1, ease, delay: 0.2 }}
                        className="col-span-12 md:col-span-5 md:col-start-8"
                    >
                        <p className="drop-cap font-serif text-lg leading-relaxed text-foreground md:text-xl">
                            Great marketing happens when strategy meets creativity meets relentless execution. We don&apos;t run campaigns — we build growth systems that compound over time.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 1, ease, delay: 0.3 }}
                        className="col-span-12 grid gap-8 border-t border-foreground/10 pt-10 md:grid-cols-3 md:gap-12"
                    >
                        <div>
                            <p className="eyebrow mb-3 text-primary">No templates</p>
                            <p className="font-serif text-base leading-relaxed text-foreground-soft">
                                Every engagement is custom-built around your goals, your audience, your market position.
                            </p>
                        </div>
                        <div>
                            <p className="eyebrow mb-3 text-primary">No generalists</p>
                            <p className="font-serif text-base leading-relaxed text-foreground-soft">
                                A specialist for every discipline — SEO, paid, brand, content, web — not a single account manager doing all of it badly.
                            </p>
                        </div>
                        <div>
                            <p className="eyebrow mb-3 text-primary">No vanity</p>
                            <p className="font-serif text-base leading-relaxed text-foreground-soft">
                                We measure what compounds: revenue, retention, brand search, organic share. Anything else is noise.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
