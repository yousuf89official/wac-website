import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-log';

// GET /api/referrals — Get current user's referral dashboard data
export async function GET() {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const userId = session!.user.id;

        // Get or create referral code
        let referralCode = await prisma.referralCode.findUnique({
            where: { userId },
            include: {
                referrals: {
                    include: {
                        referredUser: { select: { id: true, name: true, email: true, createdAt: true } },
                        commissions: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        // Auto-generate code if none exists
        if (!referralCode) {
            const name = session!.user.name || session!.user.email?.split('@')[0] || 'user';
            const code = `${name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)}-CI`;
            referralCode = await prisma.referralCode.create({
                data: { code, userId },
                include: {
                    referrals: {
                        include: {
                            referredUser: { select: { id: true, name: true, email: true, createdAt: true } },
                            commissions: true,
                        },
                    },
                },
            });
        }

        // Get milestones
        const milestones = await prisma.milestoneReward.findMany({
            where: { userId },
            orderBy: { claimedAt: 'desc' },
        });

        // Get user's subscription for commission rate
        const subscription = await prisma.subscription.findFirst({
            where: { userId, status: { in: ['active', 'trialing'] } },
            include: { plan: true },
        });
        const planQuotas = subscription?.plan ? JSON.parse(subscription.plan.quotas) : { referralCommission: 0.10 };
        const baseCommissionRate = planQuotas.referralCommission || 0.10;

        // Calculate total boost from milestones
        const totalBoost = milestones.reduce((sum: number, m: any) => sum + (m.boostPct || 0), 0);
        const effectiveRate = Math.min(baseCommissionRate + totalBoost, 0.40); // Cap at 40%

        // Aggregate earnings
        const activeReferrals = referralCode.referrals.filter((r: any) => r.status === 'active').length;
        const totalReferrals = referralCode.referrals.length;
        const totalEarnings = referralCode.referrals.reduce((sum: number, r: any) =>
            sum + r.commissions.reduce((cs: number, c: any) => cs + (c.status !== 'rejected' ? c.amount : 0), 0), 0);
        const pendingEarnings = referralCode.referrals.reduce((sum: number, r: any) =>
            sum + r.commissions.reduce((cs: number, c: any) => cs + (c.status === 'pending' ? c.amount : 0), 0), 0);
        const paidEarnings = referralCode.referrals.reduce((sum: number, r: any) =>
            sum + r.commissions.reduce((cs: number, c: any) => cs + (c.status === 'paid' ? c.amount : 0), 0), 0);

        return NextResponse.json({
            code: referralCode.code,
            clicks: referralCode.clicks,
            isActive: referralCode.isActive,
            stats: {
                totalReferrals,
                activeReferrals,
                totalEarnings,
                pendingEarnings,
                paidEarnings,
                baseCommissionRate,
                totalBoost,
                effectiveRate,
            },
            referrals: referralCode.referrals.map((r: any) => ({
                id: r.id,
                user: r.referredUser,
                status: r.status,
                convertedAt: r.convertedAt,
                createdAt: r.createdAt,
                totalCommission: r.commissions.reduce((s: number, c: any) => s + c.amount, 0),
            })),
            milestones,
            // Next milestone info
            nextMilestone: getNextMilestone(activeReferrals, milestones),
        });
    } catch (err) {
        console.error('Referrals error:', err);
        return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
    }
}

function getNextMilestone(activeCount: number, claimed: any[]) {
    const milestones = [
        { key: 'first_referral', threshold: 1, bonus: 5000, boost: 0, label: 'First Referral' },
        { key: 'five_referrals', threshold: 5, bonus: 20000, boost: 0.02, label: '5 Active Referrals' },
        { key: 'ten_referrals', threshold: 10, bonus: 50000, boost: 0.03, label: '10 Active Referrals' },
        { key: 'twenty_five', threshold: 25, bonus: 100000, boost: 0.05, label: '25 Active Referrals' },
        { key: 'fifty', threshold: 50, bonus: 250000, boost: 0.05, label: '50 Active Referrals' },
        { key: 'hundred', threshold: 100, bonus: 500000, boost: 0.05, label: '100 Active Referrals' },
    ];
    const claimedKeys = new Set(claimed.map((m: any) => m.milestone));
    return milestones.find(m => !claimedKeys.has(m.key) && activeCount < m.threshold) || null;
}
