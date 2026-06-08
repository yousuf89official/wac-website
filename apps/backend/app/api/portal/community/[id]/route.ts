import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/auth-customer';
import { communityReplySchema } from '@/lib/validations';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireCustomer();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const postId = Number(id);
    if (!Number.isInteger(postId)) {
        return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
    }

    const post = await prisma.communityPost.findUnique({
        where: { id: postId },
        include: {
            customer: { select: { firstName: true, lastName: true } },
            course: { select: { title: true } },
            replies: {
                orderBy: { createdAt: 'asc' },
                include: {
                    customer: { select: { firstName: true, lastName: true } },
                },
            },
        },
    });

    if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireCustomer();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const postId = Number(id);
    if (!Number.isInteger(postId)) {
        return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = communityReplySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const post = await prisma.communityPost.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const reply = await prisma.communityReply.create({
        data: {
            postId,
            customerId: auth.customerId,
            content: parsed.data.content,
        },
        include: {
            customer: { select: { firstName: true, lastName: true } },
        },
    });

    return NextResponse.json({ reply }, { status: 201 });
}
