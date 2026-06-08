"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * Closing CTA — full-bleed sienna, oversized type that goes WONK on hover.
 * The signature "memorable moment" of the page.
 */
export function CTAFinale() {
    const [hovered, setHovered] = useState(false);

    return (
        <section id="contact" className="relative isolate scroll-mt-24 border-t border-foreground/10">
            <div className="bg-primary text-primary-foreground">
                <div className="mx-auto grid min-h-[80vh] max-w-[1440px] grid-cols-12 gap-x-6 px-6 py-30 md:px-12 md:py-40 lg:px-20">
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="col-span-12 mb-8 flex items-center gap-3 text-2xs font-semibold uppercase tracking-widest"
                    >
                        <span className="inline-block h-px w-10 bg-primary-foreground/40" />
                        <span>Let&apos;s Begin</span>
                    </motion.p>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                        onHoverStart={() => setHovered(true)}
                        onHoverEnd={() => setHovered(false)}
                        className="col-span-12 select-none font-display text-[clamp(3rem,11vw,11rem)] font-medium leading-[0.88] tracking-tightest"
                        style={{
                            fontVariationSettings: hovered
                                ? '"opsz" 144, "SOFT" 100, "WONK" 1'
                                : '"opsz" 144, "SOFT" 0, "WONK" 0',
                            transition: "font-variation-settings 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                    >
                        Let&apos;s build something{" "}
                        <span className="italic">unforgettable.</span>
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                        className="col-span-12 mt-16 flex flex-col gap-4 sm:flex-row sm:items-center md:col-span-9"
                    >
                        <Link
                            href="/checkout"
                            className="group inline-flex h-16 items-center justify-center gap-4 rounded-full bg-primary-foreground px-10 text-sm font-semibold uppercase tracking-widest text-primary transition-all hover:gap-6 hover:bg-primary-foreground/95"
                        >
                            Schedule a strategy call
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                        </Link>
                        <Link
                            href="mailto:hello@wearecollaborative.net"
                            className="inline-flex h-16 items-center px-2 text-sm font-semibold uppercase tracking-widest text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                        >
                            or email us directly
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
                        className="col-span-12 mt-20 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-primary-foreground/20 pt-8 font-mono text-2xs uppercase tracking-widest text-primary-foreground/70"
                    >
                        <span>Jakarta · Singapore · Sydney · NYC</span>
                        <span>Booking Q3 partnerships</span>
                        <span className="ml-auto">hello@wearecollaborative.net</span>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
