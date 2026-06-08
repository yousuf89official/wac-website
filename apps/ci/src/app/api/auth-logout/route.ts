/**
 * Clears the WAC customer cookie on the parent domain so both apex (WAC) and
 * CI subdomain forget the session simultaneously. The domain attribute must
 * match the one used when setting the cookie — see
 * apps/wac/lib/auth-customer.ts.
 *
 * Returns 200 even if no cookie was present (idempotent).
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { WAC_COOKIE_NAME } from "@/lib/wac-auth";

const COOKIE_DOMAIN =
    process.env.NODE_ENV === "production"
        ? process.env.COOKIE_DOMAIN || ".wearecollaborative.net"
        : undefined;

export const dynamic = "force-dynamic";

export async function POST() {
    const cookieStore = await cookies();
    cookieStore.set(WAC_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        domain: COOKIE_DOMAIN,
        maxAge: 0,
    });
    return NextResponse.json({ ok: true });
}
