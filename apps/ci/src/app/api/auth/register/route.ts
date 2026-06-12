/**
 * CI-native self-registration. Creates a CI User (role `viewer`, active
 * immediately) in CI's own database and signs them straight in with a
 * `ci-session` cookie. Independent of the WAC backend's customer accounts.
 */

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCiSession, setCiSessionCookie, MASTER_EMAIL } from "@/lib/ci-auth";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const email = String(body.email || "").toLowerCase().trim();
        const password = String(body.password || "");
        const name = body.name ? String(body.name).trim() : null;

        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }
        if (email === MASTER_EMAIL) {
            return NextResponse.json({ error: "This email is reserved" }, { status: 409 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
        }

        const hash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { email, password: hash, name, role: "viewer", status: "Active" },
        });

        const token = await createCiSession({ userId: user.id, email: user.email, role: user.role });
        await setCiSessionCookie(token);

        return NextResponse.json({
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });
    } catch (error) {
        console.error("CI register error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
