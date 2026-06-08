import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, requireAuth } from '@/lib/api-auth';

// GET /api/users
// ?self=true — returns the current user's own profile (auth only, no admin required)
// Otherwise — returns all users (admin required)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const self = searchParams.get('self');

    if (self === 'true') {
        const { error, session } = await requireAuth();
        if (error) return error;
        try {
            const user = await prisma.user.findUnique({
                where: { id: session!.user.id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    workRole: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
            return NextResponse.json(user);
        } catch (error) {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }

    const { error } = await requireAdmin();
    if (error) return error;
    try {
        const users = await prisma.user.findMany({
            where: {
                status: {
                    not: 'Archive'
                }
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                workRole: true,
                status: true,
                permissions: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
