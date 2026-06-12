/**
 * Resolves the current Collaborative Intelligence user.
 *
 * Two — and only two — ways to be authenticated on CI:
 *   1. A CI-native session (`ci-session` cookie) → a row in CI's own User table.
 *      This is how every regular CI user signs in (see /api/auth/login).
 *   2. The master bridge: the shared `wac-customer-token` cookie, accepted ONLY
 *      when it belongs to the master admin (yousuf@wearecollaborative.net). The
 *      master is the single identity shared across both products; the row is
 *      upserted as `masteradmin` on first access.
 *
 * Regular WAC customers carry a `wac-customer-token` too (it's on
 * .wearecollaborative.net), but since their email isn't the master's, CI ignores
 * it — they have no CI access unless they register a CI-native account.
 *
 * Returns the CI User on success, null otherwise. Callers redirect
 * unauthenticated users to CI's own /login (see (protected)/layout.tsx).
 */

import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { verifyWacCustomerToken, WAC_COOKIE_NAME } from "./wac-auth";
import { verifyCiSession, getCiSessionCookie, MASTER_EMAIL } from "./ci-auth";

export type SessionUser = NonNullable<
    Awaited<ReturnType<typeof getCurrentUser>>
>;

const INACTIVE_STATUSES = new Set(["Suspended", "Inactive"]);

export async function getCurrentUser() {
    // 1. CI-native session — the primary path for CI's own users.
    const ciToken = await getCiSessionCookie();
    if (ciToken) {
        const payload = await verifyCiSession(ciToken);
        if (payload) {
            const user = await prisma.user.findUnique({ where: { id: payload.userId } });
            if (user && !INACTIVE_STATUSES.has(user.status)) return user;
        }
    }

    // 2. Master bridge — the ONLY shared identity. Accept the WAC customer
    //    cookie solely when it belongs to the master admin.
    const cookieStore = await cookies();
    const wacToken = cookieStore.get(WAC_COOKIE_NAME)?.value;
    if (wacToken) {
        const wac = await verifyWacCustomerToken(wacToken);
        if (wac && wac.email.toLowerCase() === MASTER_EMAIL) {
            return await ensureMasterAdmin(wac.firstName, wac.lastName);
        }
    }

    return null;
}

/** Idempotently ensure the master admin exists as `masteradmin` in CI's DB. */
async function ensureMasterAdmin(firstName?: string, lastName?: string) {
    const name = [firstName, lastName].filter(Boolean).join(" ") || "Yousuf Noor";
    return await prisma.user.upsert({
        where: { email: MASTER_EMAIL },
        update: { role: "masteradmin", status: "Active" },
        create: {
            email: MASTER_EMAIL,
            password: null, // master signs in via the WAC bridge, not a CI password
            name,
            role: "masteradmin",
            status: "Active",
        },
    });
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
