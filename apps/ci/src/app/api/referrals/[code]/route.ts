import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/referrals/[code] — Public: track a referral click
export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        const referralCode = await prisma.referralCode.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!referralCode || !referralCode.isActive) {
            return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
        }

        // Increment click count
        await prisma.referralCode.update({
            where: { id: referralCode.id },
            data: { clicks: { increment: 1 } },
        });

        return NextResponse.json({
            valid: true,
            code: referralCode.code,
        });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to process referral' }, { status: 500 });
    }
}
