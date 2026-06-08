import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

/**
 * Visitors landing on the bare CI subdomain (intelligence.wearecollaborative.net)
 * are routed by auth state. Authenticated users (valid WAC customer JWT) go to
 * /dashboard; everyone else bounces to WAC's /login with a returnTo back here.
 *
 * Identity lives in WAC (Phase 4) — there is no /auth route on the CI app, so we
 * must send unauthenticated visitors to WAC, mirroring (protected)/layout.tsx.
 *
 * The product's marketing landing is on the WAC apex at
 * wearecollaborative.net/intelligence — see
 * apps/wac/app/(marketing)/intelligence/page.tsx. We do not duplicate it here.
 */
export default async function CIRoot() {
    const user = await getCurrentUser();
    if (user) redirect("/dashboard");

    const wacBaseUrl = process.env.NEXT_PUBLIC_WAC_URL || "https://wearecollaborative.net";
    const returnTo = encodeURIComponent(
        process.env.NEXT_PUBLIC_CI_URL || "https://intelligence.wearecollaborative.net"
    );
    redirect(`${wacBaseUrl}/login?returnTo=${returnTo}`);
}
