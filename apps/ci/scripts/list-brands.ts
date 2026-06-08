import { prisma } from './src/lib/prisma';

async function main() {
    const brands = await prisma.brand.findMany();
    console.log('Brands:', brands);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
