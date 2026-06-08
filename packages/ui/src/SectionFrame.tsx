"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
    /** Section number — e.g. "01", "02". Rendered in mono on the left margin. */
    n?: string;
    /** Small uppercase label above the headline. */
    eyebrow?: string;
    /** Optional headline. Use italic spans for emphasis. */
    headline?: ReactNode;
    /** Optional supporting paragraph beneath the headline. */
    lede?: ReactNode;
    /** Body content for the section. */
    children: ReactNode;
    /** Tighter top padding for stacked sections. */
    tight?: boolean;
}

/**
 * Generic section wrapper for inner pages. Provides the editorial chrome
 * (top hairline, eyebrow, asymmetric headline + lede grid) so each page only
 * worries about its body content.
 */
export function SectionFrame({ n, eyebrow, headline, lede, children, tight }: Props) {
    const ease = [0.16, 1, 0.3, 1] as const;
    return (
        <section
            className={`relative border-t border-foreground/10 ${
                tight ? "py-20 md:py-24" : "py-30 md:py-40"
            }`}
        >
            <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
                {(eyebrow || n) && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.7, ease }}
                        className="mb-10 flex items-center gap-4 md:mb-14"
                    >
                        {n && (
                            <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                {n}
                            </span>
                        )}
                        {eyebrow && (
                            <>
                                <span className="inline-block h-px w-10 bg-foreground-soft" />
                                <span className="eyebrow">{eyebrow}</span>
                            </>
                        )}
                    </motion.div>
                )}

                {(headline || lede) && (
                    <div className="mb-16 grid grid-cols-12 items-end gap-x-6 gap-y-6 md:mb-24">
                        {headline && (
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.9, ease, delay: 0.05 }}
                                className="col-span-12 font-display text-[clamp(2.25rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-tight md:col-span-7"
                            >
                                {headline}
                            </motion.h2>
                        )}
                        {lede && (
                            <motion.p
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.9, ease, delay: 0.2 }}
                                className="col-span-12 font-serif text-base leading-relaxed text-foreground-soft md:col-span-4 md:col-start-9 md:text-lg"
                            >
                                {lede}
                            </motion.p>
                        )}
                    </div>
                )}

                {children}
            </div>
        </section>
    );
}
