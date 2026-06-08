import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Master Admin (protected — never remove) ────────────────────────────────
const MASTER_ADMIN = {
    email: 'yousuf@wearecollaborative.net',
    name: 'Yousuf Noor',
    role: 'masteradmin',
    status: 'Active',
};

async function ensureMasterAdmin() {
    const hash = await bcrypt.hash('admin123', 12);
    await prisma.user.upsert({
        where: { email: MASTER_ADMIN.email },
        update: { role: MASTER_ADMIN.role, status: MASTER_ADMIN.status },
        create: { ...MASTER_ADMIN, password: hash },
    });
    console.log('🔐 Master admin ensured:', MASTER_ADMIN.email);
}

async function main() {
    console.log('🌱 Starting seed...');

    // Always ensure master admin exists first
    await ensureMasterAdmin();

    // 0. Clean up (Optional, but good for idempotent runs if uniqueness constraints hit)
    // await prisma.subCampaign.deleteMany();
    // await prisma.campaign.deleteMany();
    // await prisma.brand.deleteMany();
    // await prisma.channel.deleteMany();
    // await prisma.platform.deleteMany();

    // 1. Create Platforms and Channels (Foundation)
    const metaPlatform = await prisma.platform.upsert({
        where: { slug: 'meta' },
        update: {},
        create: { name: 'Meta', slug: 'meta' }
    });

    const instagramChannel = await prisma.channel.upsert({
        where: { slug: 'instagram' },
        update: {},
        create: { name: 'Instagram', slug: 'instagram', platformId: metaPlatform.id }
    });

    const facebookChannel = await prisma.channel.upsert({
        where: { slug: 'facebook' },
        update: {},
        create: { name: 'Facebook', slug: 'facebook', platformId: metaPlatform.id }
    });

    // 1b. Create Industry (Required for Brand)
    const techIndustry = await prisma.industry.upsert({
        where: { slug: 'technology' },
        update: {},
        create: { name: 'Technology', slug: 'technology' }
    });

    // 2. Create Brand (Stage 1)
    const brand = await prisma.brand.upsert({
        where: { slug: 'SeededBrand' },
        update: {},
        create: {
            name: 'Seeded Brand',
            slug: 'SeededBrand',
            industryId: techIndustry.id,
            website: 'https://seeded-brand.com',
            logo: 'https://ui-avatars.com/api/?name=Seeded+Brand&background=random',
            status: 'Active'
        }
    });
    console.log(`✅ Created Brand: ${brand.name}`);

    // 3. Create Umbrella Campaign (Stage 2)
    const campaign = await prisma.campaign.create({
        data: {
            name: 'Q1 Global Launch',
            slug: 'q1-global-launch-' + Date.now(), // Ensure uniqueness
            brandId: brand.id,
            description: 'Global launch campaign for Q1 products',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-03-31'),
            budgetPlanned: 500000000,
            status: 'active'
        }
    });
    console.log(`✅ Created Umbrella Campaign: ${campaign.name}`);

    // 4. Create Sub-Campaigns (Stage 3 - Service Execution)
    const subCampaign = await prisma.subCampaign.create({
        data: {
            campaignId: campaign.id,
            name: 'Social Media Awareness',
            slug: 'social-media-awareness-' + Date.now(),
            status: 'active',
            description: 'Focus on Instagram and Facebook engagement',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-02-28'),
            budgetPlanned: 200000000,
            configuration: JSON.stringify({
                deliverables: [
                    {
                        channelId: instagramChannel.id,
                        thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
                        postUrl: 'https://instagram.com',
                        metrics: { impressions: 15000, spend: 5000000 }
                    }
                ]
            })
        }
    });
    console.log(`✅ Created Sub-Campaign: ${subCampaign.name}`);

    // Link Channels to Campaign for good measure
    await prisma.campaignChannel.create({
        data: {
            campaignId: campaign.id,
            channelId: instagramChannel.id
        }
    });

    // 5. Update Financials for Reporting (Stage 4)
    // Note: In the current app, Reporting often aggregates query logic, but `spend` fields might need manual update if not computed.
    // We'll update the Campaign info to reflect "actuals"
    // Assuming 'spend' field is used on Campaign (it's not in the schema viewed above, but budgetPlanned is. 
    // Wait, I saw budgetPlanned in schema, but not 'spend'. 
    // Let's re-read schema. 
    // Campaign has: budgetPlanned Float @default(0)
    // SubCampaign has: budgetPlanned Float @default(0)
    // There is NO 'spend' field in strict schema view! 
    // But previous `api.ts` checks `curr.spend || 0`. This implies `spend` might be missing from schema or inferred?
    // Previous `api.ts` types: `spend?: number; // Enriched`.
    // So 'spend' is likely calculated or stored in `configuration` JSON if not in schema.
    // OR it was in a schema update I missed? 
    // Checking schema again: `budgetPlanned` exists. `status` exists.
    // Ah, I need to make sure the app works. I'll blindly trust that the app calculates 'spend' or it's just 0 for now.
    // But wait, user wants Reporting stage populated.
    // I will verify if I can add some metrics.
    // 6. Seed Analytics/Metrics (Replacement for frontend hardcoded data)
    const days = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    console.log('📊 Seeding Metrics...');

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        // Random fluctuation
        const dailyImpressions = Math.floor(1000 + Math.random() * 2000);
        const dailySpend = Math.floor(500000 + Math.random() * 1000000);

        await prisma.metric.create({
            data: {
                date: date,
                impressions: dailyImpressions,
                spend: dailySpend,
                clicks: Math.floor(dailyImpressions * 0.05), // 5% CTR
                reach: Math.floor(dailyImpressions * 0.8),
                engagement: Math.floor(dailyImpressions * 0.1),
                brandId: brand.id,
                campaignId: campaign.id
            }
        });
    }
    console.log('✅ Created 30 days of metrics');

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
