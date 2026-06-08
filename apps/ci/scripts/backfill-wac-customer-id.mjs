/**
 * One-time backfill — link existing CI User rows to WAC's Customer rows by
 * matching email. Run AFTER Phase 4 deploys.
 *
 *   node scripts/backfill-wac-customer-id.mjs
 *
 * For each CI User without wacCustomerId, this script fetches the matching
 * Customer from WAC via the /api/admin/customer-lookup endpoint (you need to
 * build that endpoint in WAC; or run a SQL export from Supabase and pass via
 * CUSTOMER_MAP_FILE — see fallback below).
 *
 * Env required:
 *   - DATABASE_POSTGRES_PRISMA_URL  (CI Neon)
 *   - WAC_BASE_URL  (e.g. https://wearecollaborative.net)
 *   - WAC_ADMIN_TOKEN  (admin JWT issued from WAC; used to call /api/admin/*)
 *   OR
 *   - CUSTOMER_MAP_FILE  (path to a JSON file: { "user@example.com": 42, ... })
 *
 * Safe to re-run: skips users that already have wacCustomerId set.
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';

const prisma = new PrismaClient();

const WAC_BASE_URL = process.env.WAC_BASE_URL || 'https://wearecollaborative.net';
const WAC_ADMIN_TOKEN = process.env.WAC_ADMIN_TOKEN;
const CUSTOMER_MAP_FILE = process.env.CUSTOMER_MAP_FILE;

async function loadEmailToCustomerIdMap() {
    if (CUSTOMER_MAP_FILE) {
        const raw = readFileSync(CUSTOMER_MAP_FILE, 'utf8');
        const map = JSON.parse(raw);
        if (typeof map !== 'object' || map === null) {
            throw new Error('CUSTOMER_MAP_FILE must be a JSON object: { email: customerId }');
        }
        return map;
    }
    if (!WAC_ADMIN_TOKEN) {
        throw new Error('Need either CUSTOMER_MAP_FILE or WAC_ADMIN_TOKEN env');
    }
    // Bulk fetch
    const res = await fetch(`${WAC_BASE_URL}/api/admin/customers`, {
        headers: { cookie: `wac-auth-token=${WAC_ADMIN_TOKEN}` },
    });
    if (!res.ok) throw new Error(`WAC fetch failed: ${res.status}`);
    const customers = await res.json();
    const map = {};
    for (const c of customers) map[c.email.toLowerCase()] = c.id;
    return map;
}

async function main() {
    console.log('› loading email→customerId map…');
    const map = await loadEmailToCustomerIdMap();
    console.log(`✓ map has ${Object.keys(map).length} entries`);

    const candidates = await prisma.user.findMany({
        where: { wacCustomerId: null },
        select: { id: true, email: true },
    });
    console.log(`› found ${candidates.length} CI users without wacCustomerId`);

    let linked = 0;
    let unmatched = 0;
    for (const u of candidates) {
        const customerId = map[u.email.toLowerCase()];
        if (!customerId) {
            unmatched++;
            continue;
        }
        await prisma.user.update({
            where: { id: u.id },
            data: { wacCustomerId: customerId },
        });
        linked++;
    }

    console.log(`✓ linked ${linked}, unmatched ${unmatched}`);
    if (unmatched > 0) {
        console.log('  Unmatched users likely never registered on WAC. They\'ll be');
        console.log('  lazily linked on next login if they sign up on WAC with the same email.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
