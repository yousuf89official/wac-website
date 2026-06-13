/**
 * CI logout. Clears the CI-native `ci-session` cookie. CI is independent of WAC,
 * so there's nothing cross-product to clear here.
 */

import { NextResponse } from "next/server";
import { clearCiSessionCookie } from "@/lib/ci-auth";

export async function POST() {
    await clearCiSessionCookie();
    return NextResponse.json({ ok: true });
}
