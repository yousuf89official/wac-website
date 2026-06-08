import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Campaigns ---');
    const campaigns = await prisma.campaign.findMany();
    console.dir(campaigns, { depth: null });

    console.log('\n--- SubCampaigns ---');
    const subCampaigns = await prisma.subCampaign.findMany();
    console.dir(subCampaigns, { depth: null });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
