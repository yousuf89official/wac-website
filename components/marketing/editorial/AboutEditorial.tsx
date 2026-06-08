"use client";

import { motion } from "framer-motion";
import { PageHero } from '@wac/ui/PageHero';
import { SectionFrame } from '@wac/ui/SectionFrame';
import { CTAFinale } from '@wac/ui/CTAFinale';

interface ValueItem {
    id: number;
    title: string;
    description: string;
}

interface ProcessStepItem {
    id: number;
    number: string;
    title: string;
    description: string;
}

interface TestimonialItem {
    id: number;
    quote: string;
    author: string;
    role: string;
    company: string;
}

interface Props {
    values: ValueItem[];
    processSteps: ProcessStepItem[];
    testimonials: TestimonialItem[];
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function AboutEditorial({ values, processSteps, testimonials }: Props) {
    // Pick the 1-2 longest testimonials for the pull-quote section.
    const pullQuotes = [...testimonials]
        .sort((a, b) => b.quote.length - a.quote.length)
        .slice(0, 2);

    return (
        <>
            <PageHero
                eyebrow="About WAC"
                headline={
                    <>
                        Built for the brands that{" "}
                        <span
                            className="italic"
                            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                        >
                            refuse
                        </span>{" "}
                        to blend in.
                    </>
                }
                lede="We Are Collaborative is a hand-picked collective of marketing specialists building growth systems for ambitious brands. No templates, no generalists, no vanity metrics — just senior operators composing strategy, story, and execution that compounds."
            />

            {/* 01 — The Founding */}
            <SectionFrame
                n="01"
                eyebrow="The Founding"
                headline={
                    <>
                        We started because the{" "}
                        <span
                            className="italic"
                            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                        >
                            agency model
                        </span>{" "}
                        was broken.
                    </>
                }
                lede="Bloated retainers. Junior account managers. Strategy decks that gathered dust. We knew there was a better way."
            >
                <div className="grid grid-cols-12 gap-x-6 gap-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.8, ease: EASE }}
                        className="col-span-12 md:col-span-6"
                    >
                        <p className="drop-cap font-serif text-lg leading-relaxed text-foreground md:text-xl">
                            We Are Collaborative was founded on a single conviction: that great marketing happens at the seams — where strategy meets craft, where data meets taste, where the analyst and the storyteller sit at the same table. Most agencies optimize for billable hours. We optimize for outcomes that compound. That meant rebuilding the studio from scratch — a small, senior collective of operators who&apos;ve led teams at the brands you&apos;ve heard of and the ones quietly outperforming them.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
                        className="col-span-12 md:col-span-5 md:col-start-8"
                    >
                        <p className="font-serif text-lg leading-relaxed text-foreground-soft md:text-xl">
                            What we build isn&apos;t a campaign — it&apos;s an engine. Brand positioning, organic acquisition, paid efficiency, content that earns attention, and the analytics infrastructure to keep tightening the loop. We work with founders and CMOs who already know what good looks like, and who want a partner who treats their P&amp;L like an extension of their own. The work is quieter than most agency reels, and the results last longer than most agency contracts.
                        </p>
                    </motion.div>
                </div>
            </SectionFrame>

            {/* 02 — What Drives Us (Values) */}
            <SectionFrame
                n="02"
                eyebrow="What Drives Us"
                headline={
                    <>
                        Five principles. Zero{" "}
                        <span
                            className="italic"
                            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                        >
                            exceptions.
                        </span>
                    </>
                }
                lede="Our values aren&rsquo;t poster phrases. They&rsquo;re the filter every decision passes through — who we hire, what we ship, which engagements we decline."
            >
                {values.length > 0 ? (
                    <ul className="grid grid-cols-1 gap-px overflow-hidden border-t border-foreground/10 bg-foreground/10 md:grid-cols-2 lg:grid-cols-3">
                        {values.map((value, i) => (
                            <motion.li
                                key={value.id}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.7, ease: EASE, delay: i * 0.06 }}
                                className="group relative bg-background p-8 transition-colors md:p-10"
                            >
                                <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <h3 className="mt-4 font-display text-2xl font-medium leading-tight tracking-tight transition-colors group-hover:text-primary md:text-3xl">
                                    {value.title}
                                </h3>
                                <p className="mt-5 font-serif text-base leading-relaxed text-foreground-soft md:text-lg">
                                    {value.description}
                                </p>
                            </motion.li>
                        ))}
                    </ul>
                ) : (
                    <p className="font-serif text-foreground-soft">No values configured.</p>
                )}
            </SectionFrame>

            {/* 03 — How We Work (Process) */}
            <SectionFrame
                n="03"
                eyebrow="How We Work"
                headline={
                    <>
                        A process built for{" "}
                        <span
                            className="italic"
                            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                        >
                            compounding
                        </span>{" "}
                        outcomes.
                    </>
                }
                lede="Every engagement moves through the same four-stage rhythm. Diagnose deeply, design honestly, deploy precisely, then iterate without ego."
            >
                {processSteps.length > 0 ? (
                    <ol className="grid grid-cols-1 border-t border-foreground/15 md:grid-cols-4">
                        {processSteps.map((step, i) => (
                            <motion.li
                                key={step.id}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
                                className="relative border-foreground/10 px-2 py-10 md:border-l md:px-8 md:py-12 md:first:border-l-0"
                            >
                                <span className="font-mono text-5xl font-light tracking-tight text-foreground-soft/70 md:text-6xl">
                                    {step.number || String(i + 1).padStart(2, "0")}
                                </span>
                                <h3 className="mt-6 font-display text-xl font-medium leading-tight tracking-tight md:text-2xl">
                                    {step.title}
                                </h3>
                                <p className="mt-3 font-serif text-base leading-relaxed text-foreground-soft">
                                    {step.description}
                                </p>
                            </motion.li>
                        ))}
                    </ol>
                ) : (
                    <p className="font-serif text-foreground-soft">No process steps configured.</p>
                )}
            </SectionFrame>

            {/* 04 — Words From Partners (Testimonials) */}
            {pullQuotes.length > 0 && (
                <SectionFrame n="04" eyebrow="Words From Partners" tight>
                    <div className="grid grid-cols-12 gap-y-20 md:gap-y-32">
                        {pullQuotes.map((t, i) => (
                            <motion.figure
                                key={t.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.9, ease: EASE, delay: 0.05 }}
                                className={
                                    i === 0
                                        ? "col-span-12 md:col-span-10"
                                        : "col-span-12 md:col-span-10 md:col-start-3"
                                }
                            >
                                <div className="relative">
                                    <span
                                        aria-hidden
                                        className="pointer-events-none absolute -left-2 -top-10 select-none font-display text-[8rem] leading-none text-primary md:-left-6 md:-top-16 md:text-[12rem]"
                                        style={{
                                            fontVariationSettings:
                                                '"opsz" 144, "SOFT" 100, "WONK" 1',
                                        }}
                                    >
                                        &ldquo;
                                    </span>
                                    <blockquote className="relative font-display text-4xl font-medium italic leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
                                        {t.quote}
                                    </blockquote>
                                </div>
                                <figcaption className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-foreground/10 pt-6 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                    <span className="text-foreground">{t.author}</span>
                                    {t.role && <span>{t.role}</span>}
                                    {t.company && (
                                        <>
                                            <span className="text-foreground-soft/40">·</span>
                                            <span>{t.company}</span>
                                        </>
                                    )}
                                </figcaption>
                            </motion.figure>
                        ))}
                    </div>
                </SectionFrame>
            )}

            <CTAFinale />
        </>
    );
}
