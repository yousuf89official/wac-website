import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    try {
        const dmmf = (prisma as any)._baseDmmf || (prisma as any)._dmmf;
        const model = dmmf.modelMap.ShareLink;
        const fieldNames = model.fields.map((f: any) => f.name);
        console.log('ShareLink Field Names:', fieldNames);
        if (fieldNames.includes('isActive')) {
            console.log('SUCCESS: isActive found in Prisma Client.');
        } else {
            console.log('FAILURE: isActive NOT found in Prisma Client.');
        }
    } catch (e) {
        console.error('Error checking Prisma Client:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
