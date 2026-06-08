import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateApiKey, hasScope } from '@/lib/api-keys';

// GET /api/v1/brands — Public API: list brands (requires read:brands scope)
export async function GET(request: Request) {
    const { error, apiKey, user } = await authenticateApiKey(request);
    if (error) return error;

    if (!hasScope(apiKey, 'read:brands')) {
        return NextResponse.json({ error: 'Insufficient scope. Required: read:brands' }, { status: 403 });
    }

    try {
        // Get brands the user has access to
        const userBrands = await prisma.userBrand.findMany({
            where: { userId: user.id },
            select: { brandId: true },
        });
        const brandIds = userBrands.map((ub: any) => ub.brandId);

        const isAdmin = ['admin', 'super_admin', 'masteradmin'].includes(user.role?.toLowerCase());

        const brands = await prisma.brand.findMany({
            where: isAdmin ? { status: 'Active' } : { id: { in: brandIds }, status: 'Active' },
            select: {
                id: true, name: true, slug: true, website: true, logo: true,
                status: true, defaultCurrency: true, description: true,
                createdAt: true, updatedAt: true,
                _count: { select: { campaigns: true, users: true } },
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({
            data: brands,
            meta: { total: brands.length },
        });
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
