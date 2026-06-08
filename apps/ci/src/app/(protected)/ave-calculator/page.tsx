'use client';

import { motion } from 'framer-motion';
import { MediaAnalyzer } from '@/components/ave/MediaAnalyzer';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AveCalculatorPage() {
    return (
        <div className="space-y-24 pb-24">
            {/* Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease }}
                className="max-w-3xl"
            >
                <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        Media tools
                    </span>
                    <span className="inline-block h-px w-10 bg-foreground-soft" />
                    <span className="font-mono text-2xs uppercase tracking-widest text-primary">
                        AVE Calculator
                    </span>
                </div>
                <h1 className="font-display text-[clamp(2.5rem,5vw,3.75rem)] font-medium leading-[0.96] tracking-tightest text-foreground">
                    Media <span className="italic text-primary">analyzer</span>.
                </h1>
                <p className="mt-6 font-serif text-lg leading-relaxed text-foreground-soft">
                    Advertising Value Equivalency translates earned coverage into
                    the cost of buying it as paid media. Pair it with Share of
                    Voice and channel efficiency to value a campaign end to end.
                </p>
            </motion.section>

            {/* Analyzer body */}
            <motion.section
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, ease }}
            >
                <MediaAnalyzer />
            </motion.section>
        </div>
    );
}
