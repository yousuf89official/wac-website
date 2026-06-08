/**
 * Verifier for the WAC customer JWT (cookie name: wac-customer-token).
 *
 * The cookie is set on `.wearecollaborative.net` by apps/wac/lib/auth-customer.ts
 * so the CI subdomain can read it via Next's cookies() API. We just verify it
 * here — issuance + sign-in pages stay in WAC.
 *
 * IMPORTANT: JWT_SECRET must be IDENTICAL between the WAC and CI Vercel
 * projects. See BACKLOG L-4 / L-5.
 *
 * Mirrored 1:1 from apps/wac/lib/auth-customer.ts:verifyCustomerToken. We do
 * not import across packages to keep apps/ci buildable standalone.
 */

import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
);

export const WAC_COOKIE_NAME = "wac-customer-token";

export interface WacCustomerPayload {
    customerId: number;
    email: string;
    firstName: string;
    lastName: string;
}

export async function verifyWacCustomerToken(
    token: string
): Promise<WacCustomerPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.type !== "customer") return null;
        return payload as unknown as WacCustomerPayload;
    } catch {
        return null;
    }
}
