import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/auth-customer';
import { communityPostSchema } from '@/lib/validations';

export async function GET() {
    const auth = await requireCustomer();
    if (auth instanceof NextResponse) return auth;

    const posts = await prisma.communityPost.findMany({
        include: {
            customer: {
                select: { firstName: true, lastName: true },
            },
            course: {
                select: { title: true },
            },
            _count: {
                select: { replies: true },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });

    return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
    const auth = await requireCustomer();
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const parsed = communityPostSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const post = await prisma.communityPost.create({
        data: {
            customerId: auth.customerId,
            title: parsed.data.title,
            content: parsed.data.content,
            courseId: parsed.data.courseId || null,
        },
        include: {
            customer: {
                select: { firstName: true, lastName: true },
            },
            _count: {
                select: { replies: true },
            },
        },
    });

    return NextResponse.json({ post }, { status: 201 });
}
