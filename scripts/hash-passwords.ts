import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();

    for (const user of users) {
        // Skip already-hashed passwords (bcrypt hashes start with $2)
        if (user.password.startsWith('$2')) {
            console.log(`User ${user.email} already hashed, skipping.`);
            continue;
        }

        const hashed = await bcrypt.hash(user.password, 12);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashed },
        });
        console.log(`Hashed password for ${user.email}`);
    }

    console.log('Password migration complete.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
