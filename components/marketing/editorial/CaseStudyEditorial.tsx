"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { SectionFrame } from '@wac/ui/SectionFrame';

export interface CaseStudyResult {
    value: string;
    label: string;
    description?: string;
}

export interface CaseStudyEditorialProps {
    title: string;
    description: string;
    client: string;
    category: string;
    image?: string | null;
    results: CaseStudyResult[];
    year?: string;
    industry?: string;
}

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Pick a single word in the title to render with WONK italic for editorial flair.
 * Heuristic: prefer the longest word > 4 chars, else the last word.
 */
function splitTitleForWonk(title: string): { before: string; wonk: string; after: string } {
    const words = title.split(/\s+/).filter(Boolean);
    if (words.length === 0) return { before: "", wonk: title, after: "" };
    let pickIdx = words.length - 1;
    let best = 0;
    words.forEach((w, i) => {
        const clean = w.replace(/[^A-Za-z]/g, "");
        if (clean.length > best && clean.length > 4) {
            best = clean.length;
            pickIdx = i;
        }
    });
    return {
        before: words.slice(0, pickIdx).join(" "),
        wonk: words[pickIdx],
        after: words.slice(pickIdx + 1).join(" "),
    };
}

/**
 * Counter that ticks up from 0 to a target numeric portion of `value` when in view.
 * Preserves non-numeric prefix/suffix (e.g. "$", "%", "x").
 */
function AnimatedNumber({ value }: { value: string }) {
    const ref = useRef<HTMLSpanElement | null>(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const [display, setDisplay] = useState<string>(value);

    useEffect(() => {
        if (!inView) return;
        const match = value.match(/^([^\d-]*)(-?[\d,.]+)(.*)$/);
        if (!match) {
            setDisplay(value);
            return;
        }
        const [, prefix, numRaw, suffix] = match;
        const numericStr = numRaw.replace(/,/g, "");
        const target = parseFloat(numericStr);
        if (Number.isNaN(target)) {
            setDisplay(value);
            return;
        }
        const decimals = (numericStr.split(".")[1] || "").length;
        const duration = 1400;
        const start = performance.now();
        let raf = 0;

        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            const current = target * eased;
            const formatted = decimals
                ? current.toFixed(decimals)
                : Math.round(current).toLocaleString("en-US");
            setDisplay(`${prefix}${formatted}${suffix}`);
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, value]);

    return <span ref={ref}>{display}</span>;
}

export function CaseStudyEditorial({
    title,
    description,
    client,
    category,
    image,
    results,
    year,
    industry,
}: CaseStudyEditorialProps) {
    const { before, wonk, after } = splitTitleForWonk(title);

    const detailRows: Array<{ label: string; value: string }> = [
        { label: "Client", value: client },
        ...(year ? [{ label: "Year", value: year }] : []),
        { label: "Category", value: category },
        ...(industry ? [{ label: "Industry", value: industry }] : []),
    ];

    return (
        <article className="bg-background text-foreground">
            {/* ─────────────── HERO ─────────────── */}
            <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
                <div
                    aria-hidden
                    className="absolute inset-0 -z-10 opacity-[0.05]"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
                        backgroundSize: "120px 120px",
                    }}
                />
                <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
                    <div className="grid grid-cols-12 gap-x-6 gap-y-10">
                        {/* Breadcrumb */}
                        <motion.nav
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.8, ease }}
                            className="col-span-12 font-mono text-2xs uppercase tracking-widest text-foreground-soft"
                            aria-label="Breadcrumb"
                        >
                            <span>Work</span>
                            <span className="px-3 text-foreground-soft/40">/</span>
                            <span className="text-foreground">{category}</span>
                        </motion.nav>

                        {/* Massive title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 1, ease, delay: 0.1 }}
                            className="col-span-12 font-display text-[clamp(3rem,10vw,10rem)] font-medium leading-[0.88] tracking-tightest"
                        >
                            {before && <span>{before} </span>}
                            <span
                                className="italic"
                                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                            >
                                {wonk}
                            </span>
                            {after && <span> {after}</span>}
                        </motion.h1>

                        {/* Lede */}
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.9, ease, delay: 0.25 }}
                            className="col-span-12 max-w-2xl font-serif text-lg leading-relaxed text-foreground-soft md:col-span-7 md:text-xl"
                        >
                            {description}
                        </motion.p>

                        {/* Detail strip */}
                        <motion.dl
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.9, ease, delay: 0.4 }}
                            className="col-span-12 md:col-span-4 md:col-start-9"
                        >
                            {detailRows.map((row, i) => (
                                <div
                                    key={row.label}
                                    className={`flex items-baseline justify-between gap-6 py-3 ${
                                        i === 0 ? "border-t border-foreground/15" : ""
                                    } border-b border-foreground/15`}
                                >
                                    <dt className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                        {row.label}
                                    </dt>
                                    <dd className="text-right font-serif text-base text-foreground">
                                        {row.value}
                                    </dd>
                                </div>
                            ))}
                        </motion.dl>
                    </div>
                </div>
            </section>

            {/* ─────────────── HERO IMAGE ─────────────── */}
            {image && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 1, ease }}
                    className="relative w-full overflow-hidden border-y border-foreground/10"
                >
                    <div className="relative aspect-video w-full">
                        <Image
                            src={image}
                            alt={title}
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover"
                        />
                    </div>
                </motion.div>
            )}

            {/* ─────────────── RESULTS ─────────────── */}
            {results.length > 0 && (
                <SectionFrame n="01" eyebrow="The Results" tight>
                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                        {results.map((r, i) => (
                            <motion.div
                                key={`${r.label}-${i}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.8, ease, delay: 0.05 * i }}
                                className="border-t border-foreground/15 pt-6"
                            >
                                <p className="font-display text-7xl font-medium leading-none tracking-tightest text-primary">
                                    <AnimatedNumber value={r.value} />
                                </p>
                                <p className="mt-4 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                    {r.label}
                                </p>
                                {r.description && (
                                    <p className="mt-3 font-serif text-base leading-relaxed text-foreground-soft">
                                        {r.description}
                                    </p>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </SectionFrame>
            )}

            {/* ─────────────── ENGAGEMENT NARRATIVE ─────────────── */}
            <SectionFrame
                n="02"
                eyebrow="The Engagement"
                headline={
                    <>
                        A partnership built on{" "}
                        <span
                            className="italic"
                            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                        >
                            outcomes.
                        </span>
                    </>
                }
                lede={`How we worked with ${client} to move the needle on ${category.toLowerCase()}.`}
            >
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.9, ease }}
                    className="grid grid-cols-12 gap-x-6 gap-y-8"
                >
                    <div className="col-span-12 md:col-span-8 md:col-start-3">
                        <p className="drop-cap font-serif text-lg leading-relaxed text-foreground md:text-xl">
                            {description}
                        </p>
                    </div>
                </motion.div>
            </SectionFrame>
        </article>
    );
}
