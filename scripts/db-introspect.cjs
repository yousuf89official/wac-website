/**
 * Pre-migration introspection (Supabase → Neon).
 * Read-only: confirms source connectivity, captures baseline row counts for
 * post-migration verification, and scans image/url columns for Supabase Storage
 * references (to decide whether the *.supabase.co image host can be dropped).
 *
 * Run from apps/wac:  node scripts/db-introspect.cjs
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
// NOTE: the DIRECT (unpooled) Supabase endpoint db.<ref>.supabase.co:5432 is
// NOT reachable from here (IPv6-only / direct endpoint disabled), so we go
// through the pooler. pgbouncer occasionally drops a prepared statement, so
// count() calls below get a small retry.
const prisma = new PrismaClient();

async function countWithRetry(model, tries = 3) {
    for (let i = 0; i < tries; i++) {
        try { return await prisma[model].count(); }
        catch (e) { if (i === tries - 1) throw e; }
    }
}

// model accessor -> delegate. Order roughly by FK dependency for later reuse.
const MODELS = [
    'user', 'brandConfig', 'themeConfig', 'sectionContent', 'service', 'servicePackage',
    'processStep', 'value', 'testimonial', 'stat', 'navLink', 'socialLink', 'client',
    'globalSeo', 'chatSession', 'chatMessage', 'caseStudy', 'blogPost', 'course',
    'customer', 'enrollment', 'order', 'payment', 'invoice', 'subscription',
    'savedResource', 'communityPost', 'communityReply', 'fAQ', 'lead',
    'visitorSession', 'visitorEvent', 'popupImpression',
];

// table.column pairs that hold URLs/paths (from schema.prisma).
const IMAGE_COLUMNS = [
    ['BrandConfig', 'logo'], ['BrandConfig', 'heroImage'], ['GlobalSeo', 'defaultImage'],
    ['Service', 'image'], ['Client', 'logo'], ['SocialLink', 'url'],
    ['CaseStudy', 'image'], ['BlogPost', 'image'], ['Course', 'image'],
    ['Testimonial', 'avatar'], ['SavedResource', 'resourceUrl'],
];

async function main() {
    console.log('Connecting to Supabase (DATABASE_URL)...\n');

    console.log('=== ROW COUNTS (baseline for verification) ===');
    let total = 0;
    for (const m of MODELS) {
        try {
            const n = await countWithRetry(m);
            total += n;
            console.log(`${m.padEnd(18)} ${n}`);
        } catch (e) {
            console.log(`${m.padEnd(18)} ERROR: ${(e.message || String(e)).replace(/\s+/g, ' ').slice(0, 120)}`);
        }
    }
    console.log(`${'TOTAL'.padEnd(18)} ${total}\n`);

    console.log('=== SUPABASE STORAGE ASSET SCAN (*.supabase.co in image/url columns) ===');
    let hits = 0;
    for (const [table, col] of IMAGE_COLUMNS) {
        try {
            const rows = await prisma.$queryRawUnsafe(
                `SELECT COUNT(*)::int AS n FROM "${table}" WHERE "${col}" ILIKE '%supabase.co%'`
            );
            const n = rows[0].n;
            hits += n;
            if (n > 0) console.log(`${table}.${col}: ${n} row(s) reference supabase.co`);
        } catch (e) {
            console.log(`${table}.${col}: skip (${(e.message || String(e)).replace(/\s+/g, ' ').slice(0, 120)})`);
        }
    }
    console.log(hits === 0
        ? '\nNo Supabase Storage references found → the *.supabase.co image host can be dropped after migration.'
        : `\n${hits} asset reference(s) on supabase.co → KEEP the image host / migrate assets separately.`);
}

main()
    .catch((e) => { console.error('FATAL:', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
