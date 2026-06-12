/**
 * Master cross-product bridge.
 *
 * The backend and Collaborative Intelligence are separate products with separate
 * user bases. The ONLY identity allowed to span both is the master admin. When
 * the master logs in (admin path), we additionally issue the shared
 * `.wearecollaborative.net` `wac-customer-token` so CI's master-only bridge can
 * verify them (see apps/ci/src/lib/session.ts). No other admin or customer
 * receives this cookie.
 */

import { createCustomerToken, setCustomerCookie } from '@/lib/auth-customer';

export const MASTER_EMAIL = 'yousuf@wearecollaborative.net';

export function isMaster(email: string): boolean {
    return email.toLowerCase() === MASTER_EMAIL;
}

/**
 * Set the shared customer cookie for the master admin so they bridge into CI.
 * `customerId` carries the admin's User id purely as an identifier; CI resolves
 * the master by EMAIL, not by this value.
 */
export async function setMasterBridgeCookie(admin: { id: number; email: string; name?: string | null }) {
    const [firstName, ...rest] = (admin.name || 'Master Admin').trim().split(/\s+/);
    const token = await createCustomerToken({
        customerId: admin.id,
        email: admin.email,
        firstName: firstName || 'Master',
        lastName: rest.join(' ') || 'Admin',
    });
    await setCustomerCookie(token);
}
