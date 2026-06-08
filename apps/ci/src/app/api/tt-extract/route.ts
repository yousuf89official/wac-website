import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseTikTokUrl } from '@/lib/tiktok';
import { requireAuth } from '@/lib/api-auth';

export async function POST(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;
    try {
        const { url } = await request.json();

        if (!url || typeof url !== 'string') {
            return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
        }

        const parsed = parseTikTokUrl(url.trim());

        if (!parsed) {
            return NextResponse.json({
                success: false,
                error: 'Invalid TikTok URL. Supported formats: video, photo, mobile, embed, short URLs.',
            }, { status: 400 });
        }

        const record = await prisma.ttExtraction.create({
            data: {
                videoId: parsed.videoId,
                shortCode: parsed.shortCode || null,
                username: parsed.username,
                postType: parsed.postType,
                originalUrl: parsed.originalUrl,
                rawInput: url.trim(),
                isShortUrl: parsed.isShortUrl,
                userId: session!.user.id,
            },
        });

        return NextResponse.json({ success: true, data: parsed, saved: true, id: record.id });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Extraction failed';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
