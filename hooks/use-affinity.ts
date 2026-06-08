"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
    type AffinityScores,
    type Category,
    type RankedCategory,
    categoryForPath,
    getAffinity,
    rank,
    trackDwell,
    trackPageView,
    trackScrollDepth,
} from "@/lib/personalization";

/**
 * Subscribes to the visitor's affinity state. On mount, reads localStorage and
 * computes decayed scores. Also auto-records a page-view + dwell + scroll-depth
 * for the current path.
 */
export function useAffinity() {
    const pathname = usePathname();
    const [scores, setScores] = useState<AffinityScores | null>(null);
    const enterRef = useRef<number>(0);
    const maxScrollRef = useRef<number>(0);

    useEffect(() => {
        setScores(getAffinity());
    }, []);

    useEffect(() => {
        if (!pathname) return;
        const category = trackPageView(pathname);
        enterRef.current = Date.now();
        maxScrollRef.current = 0;
        setScores(getAffinity());

        if (!category) return;

        const onScroll = () => {
            const h = document.documentElement;
            const max = h.scrollHeight - h.clientHeight;
            if (max <= 0) return;
            const pct = Math.min(1, h.scrollTop / max);
            if (pct > maxScrollRef.current) maxScrollRef.current = pct;
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", onScroll);
            const dwell = Date.now() - enterRef.current;
            trackDwell(category, dwell);
            trackScrollDepth(category, maxScrollRef.current);
            setScores(getAffinity());
        };
    }, [pathname]);

    const ranked: RankedCategory[] = scores ? rank(scores) : [];
    const top: Category | null = ranked.length > 0 && ranked[0].score > 0 ? ranked[0].category : null;

    return { scores, ranked, top };
}
