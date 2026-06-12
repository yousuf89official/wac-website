/**
 * CI logout. Clears the CI-native `ci-session` cookie and also expires the
 * shared `wac-customer-token` (so the master's bridge ends here too — their WAC
 * admin cookie is host-only to app. and unaffected).
 */

import { NextResponse } from "next/server";
import { clearCiSessionCookie } from "@/lib/ci-auth";
import { WAC_COOKIE_NAME } from "@/lib/wac-auth";
import { cookies } from "next/headers";

export async function POST() {
    await clearCiSessionCookie();

    // Expire the shared WAC customer cookie (used by the master bridge). Must
    // match the domain it was set with, or the browser keeps it.
    const cookieStore = await cookies();
    cookieStore.set(WAC_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        domain: process.env.NODE_ENV === "production"
            ? (process.env.COOKIE_DOMAIN || ".wearecollaborative.net")
            : undefined,
        maxAge: 0,
    });

    return NextResponse.json({ ok: true });
}
