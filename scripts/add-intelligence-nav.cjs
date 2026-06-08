/**
 * One-shot script — adds the "Intelligence" nav link if missing and
 * rebases the order of existing links. Safe to re-run.
 *
 *   node scripts/add-intelligence-nav.cjs
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TARGET = { label: 'Intelligence', href: '/intelligence', order: 1 };

async function main() {
    const existing = await prisma.navLink.findFirst({ where: { href: TARGET.href } });

    if (existing) {
        console.log(`✓ Nav link "${TARGET.label}" already present (id=${existing.id})`);
        return;
    }

    // Shift everything else down by 1 so Intelligence can claim order=1
    const others = await prisma.navLink.findMany({ orderBy: { order: 'asc' } });
    for (const link of others) {
        await prisma.navLink.update({
            where: { id: link.id },
            data: { order: link.order + 1 },
        });
    }

    const created = await prisma.navLink.create({ data: TARGET });
    console.log(`✓ Created nav link "${TARGET.label}" (id=${created.id}) at order=${TARGET.order}`);
    console.log(`  Shifted ${others.length} existing links down by 1.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
