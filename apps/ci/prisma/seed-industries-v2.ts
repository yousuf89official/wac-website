import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const industryData = [
    {
        name: "Technology & Software",
        subTypes: ["SaaS", "Hardware", "Cybersecurity", "Artificial Intelligence", "Cloud Computing"]
    },
    {
        name: "E-commerce & Retail",
        subTypes: ["Direct-to-Consumer (DTC)", "Marketplace", "Luxury Goods", "Apparel & Accessories", "Home & Garden"]
    },
    {
        name: "Finance & Banking",
        subTypes: ["Fintech", "Investment Banking", "Insurance", "Cryptocurrency", "Personal Finance"]
    },
    {
        name: "Healthcare & Pharmaceuticals",
        subTypes: ["Biotechnology", "Telemedicine", "Medical Devices", "Wellness & Fitness", "Hospitals"]
    },
    {
        name: "Energy & Utilities",
        subTypes: ["Renewable Energy", "Oil & Gas", "Power Utilities", "Electric Vehicles"]
    },
    {
        name: "Manufacturing & Industrial",
        subTypes: ["Aerospace", "Automotive", "Chemicals", "Electronics", "Robotics"]
    },
    {
        name: "Media & Entertainment",
        subTypes: ["Streaming Services", "Gaming", "Social Media", "Publishing", "Music & Audio"]
    },
    {
        name: "Travel & Hospitality",
        subTypes: ["Airlines", "Hotels & Resorts", "Booking Platforms", "Cruises", "Tour Operators"]
    },
    {
        name: "Food & Beverage",
        subTypes: ["Packaged Foods", "Alcoholic Beverages", "Restaurants", "Health Food", "Beverages"]
    },
    {
        name: "Professional Services",
        subTypes: ["Marketing Agency", "Legal Consulting", "HR & Recruitment", "IT Services", "Real Estate"]
    }
];

async function main() {
    console.log('Seeding industries and sub-types...');

    for (const data of industryData) {
        const industrySlug = data.name.toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const industry = await prisma.industry.upsert({
            where: { slug: industrySlug },
            update: { name: data.name },
            create: { name: data.name, slug: industrySlug }
        });

        console.log(`Processing sub-types for: ${data.name}`);
        for (const subName of data.subTypes) {
            const subSlug = `${industrySlug}-${subName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/(^-|-$)/g, '');

            await prisma.industrySubType.upsert({
                where: { slug: subSlug },
                update: { name: subName },
                create: {
                    name: subName,
                    slug: subSlug,
                    industryId: industry.id
                }
            });
        }
    }

    console.log('Done seeding industries and sub-types.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
