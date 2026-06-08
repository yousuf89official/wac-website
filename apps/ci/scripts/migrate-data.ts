import mysql from 'mysql2/promise';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const prisma = new PrismaClient();

// MySQL connection (Legacy)
const mysqlConfig = {
    host: 'localhost',
    user: 'wasintelligence',
    password: 'WAS!2025Intel',
    database: 'collaborative-intelligence'
};

const executeMySQL = async (sql: string, params: any[] = []) => {
    const conn = await mysql.createConnection(mysqlConfig);
    const [rows] = await conn.execute(sql, params);
    await conn.end();
    return rows as any[];
};

async function main() {
    console.log('Starting migration from MySQL to SQLite...');

    try {
        // 1. Users
        console.log('Migrating Users...');
        // Users table structure might vary but basic query:
        // Assuming table 'users' exists and has standard fields.
        // Legacy system used 'get_users' query which likely selected * from users.
        const users = await executeMySQL('SELECT * FROM users');
        for (const u of users) {
            // Check if exists using email
            const exists = await prisma.user.findUnique({ where: { email: u.email } });
            if (!exists) {
                await prisma.user.create({
                    data: {
                        id: u.id || randomUUID(),
                        email: u.email,
                        password: u.password, // Keep hashed
                        name: u.name,
                        role: u.role || 'user',
                        createdAt: u.createdAt || new Date(),
                        updatedAt: u.updatedAt || new Date()
                    }
                });
            }
        }
        console.log(`Migrated ${users.length} users.`);

        // 2. Brands
        console.log('Migrating Brands...');
        const brands = await executeMySQL('SELECT * FROM brands'); // Simplify, assuming table brands exists
        for (const b of brands) {
            const exists = await prisma.brand.findUnique({ where: { slug: b.slug } });
            if (!exists) {
                await prisma.brand.create({
                    data: {
                        id: b.id.toString(), // ensure string
                        name: b.name,
                        slug: b.slug,
                        industry: b.industry,
                        // industrySubTypeId: b.industrySubTypeId, // might need check if compatible
                        website: b.website,
                        logo: b.logo,
                        status: b.status || 'Active',
                        createdAt: b.createdAt || new Date(),
                        updatedAt: b.updatedAt || new Date()
                    }
                });
            }
        }
        console.log(`Migrated ${brands.length} brands.`);

        // 3. Campaigns
        console.log('Migrating Campaigns...');
        const campaigns = await executeMySQL('SELECT * FROM campaigns');
        let campaignCount = 0;
        for (const c of campaigns) {
            // Check foreign key brandId
            const brandExists = await prisma.brand.findUnique({ where: { id: c.brandId.toString() } });
            if (brandExists) {
                await prisma.campaign.create({
                    data: {
                        id: c.id.toString(),
                        name: c.name,
                        slug: c.slug,
                        description: c.description,
                        startDate: c.startDate,
                        endDate: c.endDate,
                        budgetPlanned: parseFloat(c.budgetPlanned || 0),
                        status: c.status || 'draft',
                        brandId: c.brandId.toString(),
                        createdAt: c.createdAt || new Date(),
                        updatedAt: c.updatedAt || new Date()
                    }
                });
                campaignCount++;
            } else {
                console.warn(`Skipping campaign ${c.name} (Brand ${c.brandId} not found)`);
            }
        }
        console.log(`Migrated ${campaignCount} campaigns.`);

        // 4. SubCampaigns
        console.log('Migrating SubCampaigns...');
        const subCampaigns = await executeMySQL('SELECT * FROM subCampaigns');
        let subCount = 0;
        for (const sc of subCampaigns) {
            const campaignExists = await prisma.campaign.findUnique({ where: { id: sc.campaignId.toString() } });
            if (campaignExists) {
                await prisma.subCampaign.create({
                    data: {
                        id: sc.id.toString(),
                        name: sc.name,
                        slug: sc.slug,
                        status: sc.status || 'draft',
                        description: sc.description,
                        startDate: sc.startDate,
                        endDate: sc.endDate,
                        budgetPlanned: parseFloat(sc.budgetPlanned || 0),
                        targetAudience: sc.targetAudience ? JSON.stringify(sc.targetAudience) : null,
                        configuration: sc.configuration ? JSON.stringify(sc.configuration) : null,
                        campaignId: sc.campaignId.toString(),
                        createdAt: sc.createdAt || new Date(),
                        updatedAt: sc.updatedAt || new Date()
                    }
                });
                subCount++;
            }
        }
        console.log(`Migrated ${subCount} sub-campaigns.`);

        // 5. Integrations
        console.log('Migrating Integrations...');
        const integrations = await executeMySQL('SELECT * FROM integrations');
        for (const i of integrations) {
            const brandExists = await prisma.brand.findUnique({ where: { id: i.brandId.toString() } });
            if (brandExists) {
                await prisma.integration.create({
                    data: {
                        id: i.id.toString(),
                        provider: i.provider,
                        accessToken: i.accessToken,
                        refreshToken: i.refreshToken,
                        customerId: i.customerId,
                        accountName: i.accountName,
                        status: i.status || 'connected',
                        brandId: i.brandId.toString(),
                        createdAt: i.createdAt || new Date(),
                        updatedAt: i.updatedAt || new Date()
                    }
                });
            }
        }
        console.log(`Migrated ${integrations.length} integrations.`);

        // 6. CMS / AppConfig
        // Assuming cms_content table
        console.log('Migrating CMS Content...');
        try {
            const cms = await executeMySQL("SELECT * FROM cms_content"); // Assuming table name
            for (const c of cms) {
                await prisma.appConfig.create({
                    data: {
                        key: `cms:${c.page}`, // e.g. cms:landing-page
                        value: typeof c.content === 'object' ? JSON.stringify(c.content) : c.content,
                        updatedAt: new Date()
                    }
                });
            }
        } catch (e) { console.log('CMS table issue (ignoring):', e.message); }

        // Theme
        try {
            const themes = await executeMySQL("SELECT * FROM themes");
            for (const t of themes) {
                await prisma.appConfig.create({
                    data: {
                        key: `theme:${t.name}`,
                        value: typeof t.colors === 'object' ? JSON.stringify(t.colors) : t.colors,
                        updatedAt: new Date()
                    }
                });
            }
        } catch (e) { console.log('Theme table issue (ignoring):', e.message); }


        console.log('Migration completed successfully.');
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
