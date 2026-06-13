/**
 * Resolves the current Collaborative Intelligence user.
 *
 * CI is a fully independent product with its own database, user base, and login.
 * The only way to be authenticated here is a CI-native session (`ci-session`
 * cookie) → a row in CI's own User table. There is NO cross-product/WAC bridge:
 * the master admin signs into CI directly with a CI password, the same as any
 * other CI user (just with the `masteradmin` role).
 *
 * Returns the CI User on success, null otherwise. Callers redirect
 * unauthenticated users to CI's own /login (see (protected)/layout.tsx).
 */

import { prisma } from "./prisma";
import { verifyCiSession, getCiSessionCookie } from "./ci-auth";

export type SessionUser = NonNullable<
    Awaited<ReturnType<typeof getCurrentUser>>
>;

const INACTIVE_STATUSES = new Set(["Suspended", "Inactive"]);

export async function getCurrentUser() {
    const ciToken = await getCiSessionCookie();
    if (!ciToken) return null;

    const payload = await verifyCiSession(ciToken);
    if (!payload) return null;

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || INACTIVE_STATUSES.has(user.status)) return null;
    return user;
}

/**
 * Convenience for API routes — returns the user or throws a 401-shaped Error.
 * Use in handlers that should never run unauthenticated.
 */
export async function requireSession() {
    const user = await getCurrentUser();
    if (!user) {
        const err = new Error("Unauthorized");
        (err as Error & { status: number }).status = 401;
        throw err;
    }
    return user;
}
