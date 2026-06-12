/**
 * CI-native login. Authenticates against CI's own User table (separate from the
 * WAC backend's customers) and issues a host-only `ci-session` cookie.
 *
 * The master admin does NOT use this route — they bridge in via the shared WAC
 * cookie (see src/lib/session.ts).
 */

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCiSession, setCiSessionCookie } from "@/lib/ci-auth";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const email = String(body.email || "").toLowerCase().trim();
        const password = String(body.password || "");

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        // Generic message — don't reveal whether the email exists.
        if (!user || !user.password) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        if (user.status === "Suspended" || user.status === "Inactive") {
            return NextResponse.json({ error: "This account is not active" }, { status: 403 });
        }
        if (user.status === "Pending") {
            return NextResponse.json({ error: "This account is awaiting approval" }, { status: 403 });
        }

        const token = await createCiSession({ userId: user.id, email: user.email, role: user.role });
        await setCiSessionCookie(token);

        return NextResponse.json({
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });
    } catch (error) {
        console.error("CI login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
