import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { requireAuth } from '@/lib/api-auth';

export async function POST(request: Request) {
    const { error } = await requireAuth();
    if (error) return error;
    try {
        const { brandId } = await request.json();

        if (!brandId) {
            return NextResponse.json({ error: 'brandId is required' }, { status: 400 });
        }

        // Check if brand exists
        const brand = await prisma.brand.findUnique({
            where: { id: brandId }
        });

        if (!brand) {
            return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
        }

        // Check for existing valid token
        let shareLink = await prisma.shareLink.findFirst({
            where: {
                brandId,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            }
        });

        if (!shareLink) {
            // Generate a unique token
            const token = nanoid(12);
            shareLink = await prisma.shareLink.create({
                data: {
                    token,
                    brandId,
                    // Optional: expiresAt could be set here
                }
            });
        }

        return NextResponse.json({
            token: shareLink.token,
            url: `${new URL(request.url).origin}/share/${shareLink.token}`
        });

    } catch (error) {
        console.error('Share Link Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
