import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

/**
 * Visitors landing on the bare CI subdomain (intelligence.wearecollaborative.net)
 * are routed by auth state. Authenticated users go to /dashboard; everyone else
 * bounces to CI's own /login (CI now has its own user base + login; the master
 * admin bridges in via the shared WAC cookie — see src/lib/session.ts).
 *
 * The product's marketing landing is on the WAC apex at
 * wearecollaborative.net/intelligence — we do not duplicate it here.
 */
export default async function CIRoot() {
    const user = await getCurrentUser();
    if (user) redirect("/dashboard");
    redirect("/login");
}
