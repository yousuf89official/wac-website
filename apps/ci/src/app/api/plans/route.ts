import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/plans — Public endpoint: returns all active plans with regional pricing
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const region = searchParams.get('region') || 'global_us';

        const plans = await prisma.plan.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                prices: {
                    where: { region },
                },
            },
        });

        // Format response: merge price into plan object
        const formatted = plans.map((plan: any) => {
            const price = plan.prices[0] || null;
            const quotas = JSON.parse(plan.quotas);
            return {
                id: plan.id,
                slug: plan.slug,
                name: plan.name,
                description: plan.description,
                quotas,
                pricing: price ? {
                    currency: price.currency,
                    monthly: price.monthly,
                    yearly: price.yearly,
                    region: price.region,
                } : null, // null = free plan or custom
            };
        });

        return NextResponse.json(formatted);
    } catch (err) {
        console.error('Plans error:', err);
        return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }
}
