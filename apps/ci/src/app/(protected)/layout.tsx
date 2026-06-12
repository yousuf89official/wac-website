import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentUser } from '@/lib/session';

/**
 * Server-rendered gate for the entire CI product. Without a valid CI session
 * (or the master bridge), bounce to CI's own /login. Resolution lives in
 * getCurrentUser (src/lib/session.ts).
 */
export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }

    return <AppShell>{children}</AppShell>;
}
