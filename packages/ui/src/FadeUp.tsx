"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
    /** Delay in seconds. */
    delay?: number;
    /** Distance to translate from in pixels. */
    y?: number;
    /** Animation duration in seconds. */
    duration?: number;
    className?: string;
}

/**
 * Editorial fade-up primitive. Triggers once when the element enters the viewport.
 * Use to wrap any block of content with the editorial entrance motion.
 */
export function FadeUp({ children, delay = 0, y = 20, duration = 0.8, className }: Props) {
    const ease = [0.16, 1, 0.3, 1] as const;
    return (
        <motion.div
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration, ease, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
