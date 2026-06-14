import { redirect } from 'next/navigation';

/**
 * The backend (app.wearecollaborative.net) is the authenticated app surface and
 * has no landing page of its own — the marketing homepage lives on the apex.
 * Without this route the bare root rendered not-found.tsx and returned a 404.
 *
 * Send the root to the portal. The dashboard layout gates auth client-side and
 * bounces unauthenticated visitors to /login, so this is correct whether or not
 * the visitor is signed in. (Also fixes the portal sidebar logo → router.push('/').)
 */
export default function Page() {
    redirect('/dashboard');
}
