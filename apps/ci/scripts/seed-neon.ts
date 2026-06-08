/**
 * One-time migration script: SQLite dev.db → Neon PostgreSQL
 * Run: npx tsx scripts/seed-neon.ts
 */
import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const sqlite = new Database('./prisma/dev.db', { readonly: true });

function getAll(table: string): any[] {
    try {
        return sqlite.prepare(`SELECT * FROM ${table}`).all();
    } catch {
        return [];
    }
}

function toDate(val: any): Date | null {
    if (!val) return null;
    if (typeof val === 'number') return new Date(val);
    return new Date(val);
}

async function main() {
    console.log('Starting SQLite → Neon migration...\n');

    // 1. Users
    const users = getAll('User');
    for (const u of users) {
        await prisma.user.upsert({
            where: { id: u.id },
            update: {},
            create: {
                id: u.id, email: u.email, password: u.password,
                name: u.name, role: u.role, status: u.status,
                createdAt: toDate(u.createdAt)!, updatedAt: toDate(u.updatedAt)!,
            },
        });
    }
    console.log(`✓ Users: ${users.length}`);

    // 2. Industries
    const industries = getAll('Industry');
    for (const i of industries) {
        await prisma.industry.upsert({
            where: { id: i.id },
            update: {},
            create: { id: i.id, name: i.name, slug: i.slug, createdAt: toDate(i.createdAt)! },
        });
    }
    console.log(`✓ Industries: ${industries.length}`);

    // 3. IndustrySubTypes
    const subTypes = getAll('IndustrySubType');
    for (const s of subTypes) {
        await prisma.industrySubType.upsert({
            where: { id: s.id },
            update: {},
            create: { id: s.id, name: s.name, slug: s.slug, industryId: s.industryId, createdAt: toDate(s.createdAt)! },
        });
    }
    console.log(`✓ IndustrySubTypes: ${subTypes.length}`);

    // 4. Brands
    const brands = getAll('Brand');
    for (const b of brands) {
        await prisma.brand.upsert({
            where: { id: b.id },
            update: {},
            create: {
                id: b.id, name: b.name, slug: b.slug,
                industryId: b.industryId || null, industrySubTypeId: b.industrySubTypeId || null,
                website: b.website, logo: b.logo, status: b.status,
                defaultCurrency: b.defaultCurrency, brandColor: b.brandColor,
                brandFontColor: b.brandFontColor, description: b.description,
                wallpapers: b.wallpapers, productImages: b.productImages,
                pricingModel: b.pricingModel, socialLinks: b.socialLinks,
                createdAt: toDate(b.createdAt)!, updatedAt: toDate(b.updatedAt)!,
            },
        });
    }
    console.log(`✓ Brands: ${brands.length}`);

    // 5. Platforms
    const platforms = getAll('Platform');
    for (const p of platforms) {
        await prisma.platform.upsert({
            where: { id: p.id },
            update: {},
            create: { id: p.id, name: p.name, slug: p.slug, status: p.status },
        });
    }
    console.log(`✓ Platforms: ${platforms.length}`);

    // 6. Channels
    const channels = getAll('Channel');
    for (const c of channels) {
        await prisma.channel.upsert({
            where: { id: c.id },
            update: {},
            create: { id: c.id, name: c.name, slug: c.slug, status: c.status, platformId: c.platformId },
        });
    }
    console.log(`✓ Channels: ${channels.length}`);

    // 7. Campaigns
    const campaigns = getAll('Campaign');
    for (const c of campaigns) {
        await prisma.campaign.upsert({
            where: { id: c.id },
            update: {},
            create: {
                id: c.id, name: c.name, slug: c.slug, description: c.description,
                startDate: toDate(c.startDate), endDate: toDate(c.endDate),
                budgetPlanned: c.budgetPlanned || 0, currency: c.currency,
                timezone: c.timezone || 'UTC', status: c.status, brandId: c.brandId,
                createdAt: toDate(c.createdAt)!, updatedAt: toDate(c.updatedAt)!,
            },
        });
    }
    console.log(`✓ Campaigns: ${campaigns.length}`);

    // 8. SubCampaigns
    const subCampaigns = getAll('SubCampaign');
    for (const s of subCampaigns) {
        await prisma.subCampaign.upsert({
            where: { id: s.id },
            update: {},
            create: {
                id: s.id, name: s.name, slug: s.slug, status: s.status,
                description: s.description, startDate: toDate(s.startDate), endDate: toDate(s.endDate),
                budgetPlanned: s.budgetPlanned || 0, region: s.region, country: s.country,
                targetAudience: s.targetAudience, configuration: s.configuration,
                campaignId: s.campaignId,
                createdAt: toDate(s.createdAt)!, updatedAt: toDate(s.updatedAt)!,
            },
        });
    }
    console.log(`✓ SubCampaigns: ${subCampaigns.length}`);

    // 9. CampaignChannels
    const cc = getAll('CampaignChannel');
    for (const c of cc) {
        await prisma.campaignChannel.upsert({
            where: { id: c.id },
            update: {},
            create: { id: c.id, campaignId: c.campaignId, channelId: c.channelId },
        });
    }
    console.log(`✓ CampaignChannels: ${cc.length}`);

    // 10. SubCampaignChannels
    const scc = getAll('SubCampaignChannel');
    for (const s of scc) {
        await prisma.subCampaignChannel.upsert({
            where: { id: s.id },
            update: {},
            create: { id: s.id, subCampaignId: s.subCampaignId, channelId: s.channelId },
        });
    }
    console.log(`✓ SubCampaignChannels: ${scc.length}`);

    // 11. Integrations
    const integrations = getAll('Integration');
    for (const i of integrations) {
        await prisma.integration.upsert({
            where: { id: i.id },
            update: {},
            create: {
                id: i.id, provider: i.provider, accessToken: i.accessToken,
                refreshToken: i.refreshToken, customerId: i.customerId,
                accountName: i.accountName, status: i.status, brandId: i.brandId,
                createdAt: toDate(i.createdAt)!, updatedAt: toDate(i.updatedAt)!,
            },
        });
    }
    console.log(`✓ Integrations: ${integrations.length}`);

    // 12. AppConfig
    const configs = getAll('AppConfig');
    for (const c of configs) {
        await prisma.appConfig.upsert({
            where: { key: c.key },
            update: {},
            create: { key: c.key, value: c.value, createdAt: toDate(c.createdAt)!, updatedAt: toDate(c.updatedAt)! },
        });
    }
    console.log(`✓ AppConfig: ${configs.length}`);

    // 13. Metrics
    const metrics = getAll('Metric');
    for (const m of metrics) {
        await prisma.metric.upsert({
            where: { id: m.id },
            update: {},
            create: {
                id: m.id, date: toDate(m.date)!, impressions: m.impressions || 0,
                spend: m.spend || 0, clicks: m.clicks || 0, reach: m.reach || 0,
                engagement: m.engagement || 0, currency: m.currency || 'USD',
                region: m.region, country: m.country, brandId: m.brandId,
                campaignId: m.campaignId, subCampaignId: m.subCampaignId,
                channelId: m.channelId,
                createdAt: toDate(m.createdAt)!, updatedAt: toDate(m.updatedAt)!,
            },
        });
    }
    console.log(`✓ Metrics: ${metrics.length}`);

    // 14. ShareLinks
    const links = getAll('ShareLink');
    for (const l of links) {
        await prisma.shareLink.upsert({
            where: { id: l.id },
            update: {},
            create: {
                id: l.id, token: l.token, brandId: l.brandId,
                isActive: Boolean(l.isActive), expiresAt: toDate(l.expiresAt),
                createdAt: toDate(l.createdAt)!, updatedAt: toDate(l.updatedAt)!,
            },
        });
    }
    console.log(`✓ ShareLinks: ${links.length}`);

    // 15. Invoices
    const invoices = getAll('Invoice');
    for (const i of invoices) {
        await prisma.invoice.upsert({
            where: { id: i.id },
            update: {},
            create: {
                id: i.id, invoiceNumber: i.invoiceNumber, date: toDate(i.date)!, dueDate: toDate(i.dueDate)!,
                sellerName: i.sellerName, sellerEmail: i.sellerEmail,
                sellerAddress: i.sellerAddress, sellerPhone: i.sellerPhone,
                buyerName: i.buyerName, buyerEmail: i.buyerEmail,
                buyerAddress: i.buyerAddress, buyerPhone: i.buyerPhone,
                items: i.items, taxRate: i.taxRate, currencySymbol: i.currencySymbol || 'Rp',
                paymentDetails: i.paymentDetails, terms: i.terms,
                signatureImage: i.signatureImage, signerName: i.signerName,
                signatureMeta: i.signatureMeta, userId: i.userId,
                status: i.status || 'Draft',
                createdAt: toDate(i.createdAt)!, updatedAt: toDate(i.updatedAt)!,
            },
        });
    }
    console.log(`✓ Invoices: ${invoices.length}`);

    console.log('\n✅ Migration complete!');
}

main()
    .catch(e => { console.error('Migration failed:', e); process.exit(1); })
    .finally(() => { prisma.$disconnect(); sqlite.close(); });
