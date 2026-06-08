/**
 * Behavior-based personalization.
 *
 * Each page hit contributes weighted "affinity" points to one or more categories.
 * Scores decay over time so recent behavior matters more than ancient.
 * State lives in localStorage (full record) + a synced cookie (compact summary)
 * so server components can SSR-personalize without waiting for hydration.
 */

export const CATEGORIES = [
    "services",
    "academy",
    "resources",
    "work",
    "about",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type AffinityScores = Record<Category, number>;

interface StoredAffinity {
    v: 1;
    scores: AffinityScores;
    lastSeen: number;
}

const STORAGE_KEY = "wac-affinity";
const COOKIE_KEY = "wac-affinity";
const HALF_LIFE_DAYS = 21; // older signals halve in weight every 3 weeks
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1y

const ZERO: AffinityScores = {
    services: 0,
    academy: 0,
    resources: 0,
    work: 0,
    about: 0,
};

/** Decay all scores toward zero by elapsed time since last seen. */
function decay(scores: AffinityScores, lastSeen: number, now: number): AffinityScores {
    if (lastSeen === 0) return scores;
    const elapsedDays = (now - lastSeen) / (1000 * 60 * 60 * 24);
    const factor = Math.pow(0.5, elapsedDays / HALF_LIFE_DAYS);
    const out: AffinityScores = { ...ZERO };
    for (const k of CATEGORIES) {
        out[k] = scores[k] * factor;
    }
    return out;
}

function read(): StoredAffinity {
    if (typeof window === "undefined") {
        return { v: 1, scores: { ...ZERO }, lastSeen: 0 };
    }
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return { v: 1, scores: { ...ZERO }, lastSeen: 0 };
        const parsed = JSON.parse(raw) as Partial<StoredAffinity>;
        if (parsed.v !== 1 || !parsed.scores) {
            return { v: 1, scores: { ...ZERO }, lastSeen: 0 };
        }
        const scores: AffinityScores = { ...ZERO };
        for (const k of CATEGORIES) {
            scores[k] = typeof parsed.scores[k] === "number" ? parsed.scores[k]! : 0;
        }
        return { v: 1, scores, lastSeen: parsed.lastSeen ?? 0 };
    } catch {
        return { v: 1, scores: { ...ZERO }, lastSeen: 0 };
    }
}

function write(record: StoredAffinity) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
        // quota / private mode
    }
    // Mirror compact ranking to a cookie so SSR can read it.
    try {
        const ranked = rank(record.scores);
        const summary = ranked.map(({ category, score }) => `${category}:${score.toFixed(2)}`).join(",");
        document.cookie = `${COOKIE_KEY}=${encodeURIComponent(summary)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
    } catch {
        // ignore
    }
}

/** Record an event. Most callers use `trackPageView`. */
export function trackEvent(category: Category, weight: number = 1): AffinityScores {
    const now = Date.now();
    const prev = read();
    const decayed = decay(prev.scores, prev.lastSeen, now);
    const next: AffinityScores = { ...decayed, [category]: decayed[category] + weight };
    write({ v: 1, scores: next, lastSeen: now });
    return next;
}

/** Increment based on the route path. Returns the inferred category, or null. */
export function trackPageView(pathname: string): Category | null {
    const cat = categoryForPath(pathname);
    if (!cat) return null;
    trackEvent(cat, 1);
    return cat;
}

/** Map a route to a content category. */
export function categoryForPath(pathname: string): Category | null {
    if (pathname.startsWith("/services")) return "services";
    if (pathname.startsWith("/academy")) return "academy";
    if (pathname.startsWith("/resources")) return "resources";
    if (pathname.startsWith("/work")) return "work";
    if (pathname.startsWith("/about")) return "about";
    return null;
}

/** Add a dwell-based bonus once the visitor has spent meaningful time on a page. */
export function trackDwell(category: Category, ms: number) {
    if (ms < 8000) return; // ignore drive-bys
    const bonus = Math.min(2, ms / 30000); // up to +2 for 30s+
    trackEvent(category, bonus);
}

/** Scroll-depth bonus: 75%+ scrolled = +1, ignored otherwise. */
export function trackScrollDepth(category: Category, pct: number) {
    if (pct >= 0.75) trackEvent(category, 1);
}

export interface RankedCategory {
    category: Category;
    score: number;
}

export function rank(scores: AffinityScores): RankedCategory[] {
    return CATEGORIES
        .map((c) => ({ category: c, score: scores[c] }))
        .sort((a, b) => b.score - a.score);
}

/** Read the current decayed scores (client-side). */
export function getAffinity(): AffinityScores {
    const now = Date.now();
    const prev = read();
    return decay(prev.scores, prev.lastSeen, now);
}

/** Parse the affinity cookie. Use this from server components. */
export function parseAffinityCookie(value: string | undefined): RankedCategory[] {
    if (!value) return [];
    try {
        const decoded = decodeURIComponent(value);
        return decoded
            .split(",")
            .map((pair) => {
                const [category, score] = pair.split(":");
                if (!CATEGORIES.includes(category as Category)) return null;
                const num = Number(score);
                if (!Number.isFinite(num)) return null;
                return { category: category as Category, score: num };
            })
            .filter((x): x is RankedCategory => x !== null);
    } catch {
        return [];
    }
}

/** Pick the top N items from an array, weighting by affinity for each item's category. */
export function rerankByAffinity<T extends { category?: Category }>(
    items: T[],
    scores: AffinityScores,
    fallback: T[] = items
): T[] {
    if (items.length === 0) return fallback;
    return [...items].sort((a, b) => {
        const sa = a.category ? scores[a.category] ?? 0 : 0;
        const sb = b.category ? scores[b.category] ?? 0 : 0;
        return sb - sa;
    });
}
