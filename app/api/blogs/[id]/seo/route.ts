import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await req.json();
        const post = await prisma.blogPost.update({
            where: { id: parseInt(params.id) },
            data: {
                metaTitle: body.metaTitle,
                metaDescription: body.metaDescription,
                focusKeyword: body.focusKeyword,
                canonicalUrl: body.canonicalUrl
            }
        });
        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating blog seo' }, { status: 500 });
    }
}
