import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: any };

// Force reset for development schema updates (skip for mock to preserve state)
if (process.env.NODE_ENV !== 'production' && process.env.USE_MOCK_DB !== 'true') {
    (global as any).prisma = undefined;
}

function createPrismaInstance(): any {
    if (process.env.USE_MOCK_DB === 'true') {
        const { createMockPrisma } = require('./mock-db');
        return createMockPrisma();
    }
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    });
}

export const prisma: any =
    globalForPrisma.prisma || createPrismaInstance();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Execute a Prisma operation with RLS context.
 * Sets PostgreSQL session variables for the current user before running the callback.
 * This ensures RLS policies can identify the requesting user.
 */
export async function withRLS<T>(
    userId: string,
    userRole: string,
    fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
    return prisma.$transaction(async (tx: any) => {
        // Set session variables for RLS policies
        await tx.$queryRawUnsafe(
            `SELECT set_config('app.current_user_id', $1, true)`,
            userId
        );
        await tx.$queryRawUnsafe(
            `SELECT set_config('app.current_user_role', $1, true)`,
            userRole
        );
        return fn(tx as unknown as PrismaClient);
    }) as Promise<T>;
}
