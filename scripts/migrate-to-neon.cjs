/**
 * Data migration: Supabase (source) → Neon (target), WAC database.
 *
 * Both DBs share the IDENTICAL Prisma schema, so this copies every row with its
 * primary key preserved, in foreign-key dependency order, then fixes the
 * autoincrement sequences so future inserts don't collide.
 *
 * Method note: the direct Supabase endpoint (db.<ref>.supabase.co:5432) is not
 * reachable from here and pg_dump/psql aren't installed, so we copy through the
 * Prisma client over the pooler instead of pg_dump/pg_restore.
 *
 * PREREQUISITES (run once, in order):
 *   1. Provision the Neon DB and grab its UNPOOLED (direct) connection string.
 *   2. Create the schema on Neon:
 *        DATABASE_URL="<neon-unpooled>" npx prisma db push --skip-generate
 *   3. Run this copy:
 *        NEON_DATABASE_URL="<neon-unpooled>" node scripts/migrate-to-neon.cjs
 *      (source defaults to the current DATABASE_URL in .env — the Supabase pooler)
 *
 * Safe to re-run: every insert uses skipDuplicates, so a second run is a no-op
 * for already-copied rows.
 *
 * Caveat: @updatedAt columns are managed by Prisma and will be stamped at
 * migration time; createdAt and all other values are preserved exactly.
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const SOURCE_URL = process.env.SOURCE_DATABASE_URL || process.env.DATABASE_URL;
const TARGET_URL = process.env.NEON_DATABASE_URL;

if (!TARGET_URL) {
    console.error('✗ NEON_DATABASE_URL is not set. Provide the Neon UNPOOLED connection string:');
    console.error('  NEON_DATABASE_URL="postgresql://...neon.tech/...?sslmode=require" node scripts/migrate-to-neon.cjs');
    process.exit(1);
}

const source = new PrismaClient({ datasources: { db: { url: SOURCE_URL } } });
const target = new PrismaClient({ datasources: { db: { url: TARGET_URL } } });

// [delegate, "TableName", hasAutoincrementId] in FK dependency order (parents first).
const MODELS = [
    // level 1 — no outgoing FKs
    ['user', 'User', true],
    ['brandConfig', 'BrandConfig', false],          // id @default(1) singleton
    ['themeConfig', 'ThemeConfig', false],          // id @default(1) singleton
    ['sectionContent', 'SectionContent', true],
    ['processStep', 'ProcessStep', true],
    ['value', 'Value', true],
    ['testimonial', 'Testimonial', true],
    ['stat', 'Stat', true],
    ['navLink', 'NavLink', true],
    ['socialLink', 'SocialLink', true],
    ['client', 'Client', true],
    ['globalSeo', 'GlobalSeo', true],
    ['caseStudy', 'CaseStudy', true],
    ['blogPost', 'BlogPost', true],
    ['fAQ', 'FAQ', true],
    // level 2 — parents referenced below
    ['service', 'Service', true],
    ['course', 'Course', true],
    ['customer', 'Customer', true],
    ['lead', 'Lead', true],
    ['visitorSession', 'VisitorSession', false],    // uuid id
    // level 3 — depend on level 2
    ['servicePackage', 'ServicePackage', true],     // → Service
    ['chatSession', 'ChatSession', false],          // uuid id, → Lead?
    ['enrollment', 'Enrollment', true],             // → Customer, Course
    ['order', 'Order', true],                       // → Customer, Course?
    ['subscription', 'Subscription', true],         // → Customer
    ['savedResource', 'SavedResource', true],       // → Customer
    ['communityPost', 'CommunityPost', true],       // → Customer, Course?
    ['visitorEvent', 'VisitorEvent', true],         // → VisitorSession
    ['popupImpression', 'PopupImpression', true],   // → VisitorSession
    // level 4 — depend on level 3
    ['chatMessage', 'ChatMessage', false],          // uuid id, → ChatSession
    ['payment', 'Payment', true],                   // → Order
    ['invoice', 'Invoice', true],                   // → Order, Customer
    ['communityReply', 'CommunityReply', true],     // → CommunityPost, Customer
];

async function readAll(model, tries = 3) {
    for (let i = 0; i < tries; i++) {
        try { return await source[model].findMany(); }
        catch (e) { if (i === tries - 1) throw e; }
    }
}

async function main() {
    console.log(`Source: ${SOURCE_URL.replace(/:[^:@/]+@/, ':***@')}`);
    console.log(`Target: ${TARGET_URL.replace(/:[^:@/]+@/, ':***@')}\n`);

    const summary = [];
    for (const [model, table] of MODELS) {
        const rows = await readAll(model);
        let inserted = 0;
        if (rows.length) {
            const res = await target[model].createMany({ data: rows, skipDuplicates: true });
            inserted = res.count;
        }
        summary.push({ table, source: rows.length, inserted });
        console.log(`${table.padEnd(18)} read ${String(rows.length).padStart(4)}  inserted ${String(inserted).padStart(4)}`);
    }

    // Fix autoincrement sequences so the next insert continues past copied IDs.
    console.log('\nResetting id sequences on target...');
    for (const [, table, autoinc] of MODELS) {
        if (!autoinc) continue;
        try {
            await target.$executeRawUnsafe(
                `SELECT setval(pg_get_serial_sequence('"${table}"','id'), GREATEST((SELECT COALESCE(MAX(id),0) FROM "${table}"),1))`
            );
        } catch (e) {
            console.log(`  ${table}: sequence reset skipped (${(e.message || '').replace(/\s+/g, ' ').slice(0, 80)})`);
        }
    }

    // Verify counts match.
    console.log('\n=== VERIFICATION (target counts) ===');
    let ok = true;
    for (const { table, source: src } of summary) {
        const model = MODELS.find((m) => m[1] === table)[0];
        const tgt = await target[model].count();
        const mark = tgt === src ? 'OK ' : 'MISMATCH';
        if (tgt !== src) ok = false;
        console.log(`${mark} ${table.padEnd(18)} source ${String(src).padStart(4)}  target ${String(tgt).padStart(4)}`);
    }
    console.log(ok ? '\n✓ All tables match.' : '\n✗ Mismatches found — review above before cutting over.');
}

main()
    .catch((e) => { console.error('FATAL:', e.message); process.exit(1); })
    .finally(async () => { await source.$disconnect(); await target.$disconnect(); });
