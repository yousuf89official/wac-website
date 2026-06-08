/**
 * Returns the current CI User as resolved from the WAC customer cookie.
 * Powers the client-side AuthContext.
 *
 * 401 (with empty body) if unauthenticated — caller treats as logged out.
 */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions,
            status: user.status,
        },
    });
}
