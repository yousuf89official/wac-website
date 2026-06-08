const attempts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const entry = attempts.get(identifier);

    if (!entry || now > entry.resetAt) {
        attempts.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
        return { allowed: true };
    }

    if (entry.count >= MAX_ATTEMPTS) {
        return {
            allowed: false,
            retryAfter: Math.ceil((entry.resetAt - now) / 1000),
        };
    }

    entry.count++;
    return { allowed: true };
}
