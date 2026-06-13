/**
 * CI-native session auth.
 *
 * Collaborative Intelligence is a fully independent product — separate database,
 * separate user base, separate login from the WAC backend. CI users authenticate
 * against CI's own `User` table and receive this `ci-session` cookie: a JWT with
 * a distinct `type: "ci"` claim and a HOST-ONLY cookie (no Domain attribute), so
 * it never leaks to app.wearecollaborative.net or the apex.
 *
 * There is no cross-product bridge. The master admin signs in here with a CI
 * password like anyone else (just with the `masteradmin` role). MASTER_EMAIL is
 * kept only to reserve that address from public self-registration.
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
);

export const CI_COOKIE_NAME = "ci-session";
const TOKEN_EXPIRY = "30d";

/** Reserved from public self-registration; provisioned as `masteradmin`. */
export const MASTER_EMAIL = "yousuf@wearecollaborative.net";

export interface CiSessionPayload {
    userId: string;
    email: string;
    role: string;
}

export async function createCiSession(payload: CiSessionPayload): Promise<string> {
    return new SignJWT({ ...payload, type: "ci" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(TOKEN_EXPIRY)
        .sign(JWT_SECRET);
}

export async function verifyCiSession(token: string): Promise<CiSessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.type !== "ci") return null;
        return payload as unknown as CiSessionPayload;
    } catch {
        return null;
    }
}

export async function setCiSessionCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(CI_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        // host-only — intentionally no `domain`, so CI sessions never reach
        // other *.wearecollaborative.net subdomains.
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });
}

export async function clearCiSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.set(CI_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
}

export async function getCiSessionCookie(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(CI_COOKIE_NAME)?.value;
}
