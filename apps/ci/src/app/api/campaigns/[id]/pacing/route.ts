import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { calculatePacing } from '@/lib/budget-pacing';

export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
    const { error } = await requireAuth();
    if (error) return error;

    const { id } = await props.params;

    try {
        const campaign = await prisma.campaign.findUnique({
            where: { id },
            select: { id: true, name: true, budgetPlanned: true, startDate: true, endDate: true },
        });

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // Aggregate total spend
        let totalSpent = 0;
        try {
            const agg = await prisma.metric.aggregate({
                where: { campaignId: id },
                _sum: { spend: true },
            });
            totalSpent = agg._sum?.spend || 0;
        } catch {
            const metrics = await prisma.metric.findMany({ where: { campaignId: id } });
            for (const m of metrics) totalSpent += Number(m.spend) || 0;
        }

        const pacing = calculatePacing({
            budgetPlanned: campaign.budgetPlanned,
            totalSpent,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
        });

        return NextResponse.json({ campaign: campaign.name, ...pacing });
    } catch (err: any) {
        return NextResponse.json({ error: 'Failed to calculate pacing', details: err.message }, { status: 500 });
    }
}
