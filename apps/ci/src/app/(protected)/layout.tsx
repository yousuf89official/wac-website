import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentUser } from '@/lib/session';

const WAC_BASE_URL = process.env.NEXT_PUBLIC_WAC_URL || 'https://wearecollaborative.net';

/**
 * Server-rendered gate for the entire CI product. If the visitor doesn't have
 * a valid WAC customer JWT, bounce them to WAC's /login with returnTo back to
 * the CI subdomain. Auto-provisioning happens inside getCurrentUser.
 *
 * Pre-Phase 4 this was open and (protected) was gated client-side via
 * useSession. Now it's server-side and bullet-proof.
 */
export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();
    if (!user) {
        const returnTo = encodeURIComponent(
            process.env.NEXT_PUBLIC_CI_URL || 'https://intelligence.wearecollaborative.net'
        );
        redirect(`${WAC_BASE_URL}/login?returnTo=${returnTo}`);
    }

    return <AppShell>{children}</AppShell>;
}
