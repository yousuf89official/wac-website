/**
 * Single source of truth for cross-app URLs in the WAC ecosystem.
 *
 * Three surfaces share the `.wearecollaborative.net` auth cookie:
 *   - SITE_URL  public marketing site (apex, indexed)      ← this app, today
 *   - APP_URL   authenticated app (login/portal/admin)     ← app.wearecollaborative.net (Phase 2)
 *   - CI_URL    Collaborative Intelligence product          ← intelligence.wearecollaborative.net
 *
 * PHASE 1: login/dashboard/checkout still live on the apex, so NEXT_PUBLIC_APP_URL
 * is unset and the helpers below return RELATIVE paths — behaviour is unchanged.
 * PHASE 2: set NEXT_PUBLIC_APP_URL=https://app.wearecollaborative.net and every
 * cross-link flips to the subdomain with no code change.
 */
export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://wearecollaborative.net';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';
export const CI_URL =
    process.env.NEXT_PUBLIC_CI_URL || 'https://intelligence.wearecollaborative.net';

// While the app still lives on the apex (APP_URL empty or === SITE_URL), emit
// relative paths. Once APP_URL points at the subdomain, prefix it.
const appBase = !APP_URL || APP_URL === SITE_URL ? '' : APP_URL.replace(/\/$/, '');

export function loginUrl(returnTo?: string): string {
    const qs = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : '';
    return `${appBase}/login${qs}`;
}

export function registerUrl(returnTo?: string): string {
    const qs = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : '';
    return `${appBase}/register${qs}`;
}

export function resetPasswordUrl(token: string): string {
    return `${appBase}/reset-password/${token}`;
}

export function dashboardUrl(path = ''): string {
    return `${appBase}/dashboard${path}`;
}

export function checkoutUrl(qs = ''): string {
    return `${appBase}/checkout${qs}`;
}
