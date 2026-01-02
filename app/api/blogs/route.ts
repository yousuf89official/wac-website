import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const posts = await prisma.blogPost.findMany({
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(posts);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching blog posts' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const post = await prisma.blogPost.create({ data: body });
        return NextResponse.json(post);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
