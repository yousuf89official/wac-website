"use client";

import { useAffinity } from "@/hooks/use-affinity";

/**
 * Invisible component. Mount once in the marketing layout — it reads pathname,
 * writes page-view / dwell / scroll-depth signals to localStorage + cookie.
 */
export function AffinityTracker() {
    useAffinity();
    return null;
}
