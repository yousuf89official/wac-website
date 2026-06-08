/**
 * Replacement for NextAuth's getServerSession on the CI app.
 *
 * Reads the WAC customer JWT, verifies it, looks up the corresponding CI User
 * by wacCustomerId, and lazily creates the User row on first access. The CI
 * User row is the per-product profile; identity lives in WAC.
 *
 * Returns the CI User on success, null otherwise. Caller is responsible for
 * redirecting unauthenticated users (typically the (protected)/layout.tsx).
 */

import { cookies } from "next/headers";
import { prisma } from "./prisma";
import {
    verifyWacCustomerToken,
    WAC_COOKIE_NAME,
    type WacCustomerPayload,
} from "./wac-auth";

export type SessionUser = NonNullable<
    Awaited<ReturnType<typeof getCurrentUser>>
>;

export async function getCurrentUser() {
    const payload = await readWacPayload();
    if (!payload) return null;
    return await resolveCiUser(payload);
}

async function readWacPayload(): Promise<WacCustomerPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(WAC_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyWacCustomerToken(token);
}

async function resolveCiUser(payload: WacCustomerPayload) {
    const existing = await prisma.user.findUnique({
        where: { wacCustomerId: payload.customerId },
    });
    if (existing) return existing;

    // Edge case: a CI user already exists with this email but no
    // wacCustomerId yet (pre-merge user). Adopt it.
    const sameEmail = await prisma.user.findUnique({
        where: { email: payload.email },
    });
    if (sameEmail) {
        return await prisma.user.update({
            where: { id: sameEmail.id },
            data: { wacCustomerId: payload.customerId },
        });
    }

    // First-time access. Provision a new CI User row.
    return await prisma.user.create({
        data: {
            email: payload.email,
            password: null, // identity lives in WAC; no CI password
            name: [payload.firstName, payload.lastName].filter(Boolean).join(" ") || null,
            role: "viewer",
            status: "Active",
            wacCustomerId: payload.customerId,
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
