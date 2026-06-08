/**
 * Server-side auth wrapper used by every CI API route.
 *
 * Phase 4 swap: this used to call NextAuth's getServerSession(). It now reads
 * the WAC customer JWT via getCurrentUser() (see ./session.ts) and shims the
 * old session shape so the ~50 downstream route handlers don't need to change.
 *
 * The shimmed `session.user` exposes the same fields callers expect:
 * { id, email, role, name, permissions } — sourced from the CI User row.
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "./session";

interface ShimmedSession {
    user: {
        id: string;
        email: string;
        role: string;
        name: string | null;
        permissions: string | null;
    };
}

function shim(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>): ShimmedSession {
    return {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            permissions: user.permissions,
        },
    };
}

/**
 * Require authentication for an API route. Returns the session or a 401 response.
 */
export async function requireAuth(): Promise<
    { error: null; session: ShimmedSession } | { error: NextResponse; session: null }
> {
    const user = await getCurrentUser();
    if (!user) {
        return {
            error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            session: null,
        };
    }
    return { error: null, session: shim(user) };
}

/**
 * Require admin role for an API route. Returns the session or a 401/403 response.
 */
export async function requireAdmin(): Promise<
    { error: null; session: ShimmedSession } | { error: NextResponse; session: null }
> {
    const { error, session } = await requireAuth();
    if (error) return { error, session: null };
    const adminRoles = ["admin", "super_admin", "masteradmin"];
    if (!adminRoles.includes(session!.user.role.toLowerCase())) {
        return {
            error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
            session: null,
        };
    }
    return { error: null, session };
}
