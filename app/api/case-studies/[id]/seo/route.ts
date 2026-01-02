import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await req.json();
        const study = await prisma.caseStudy.update({
            where: { id: parseInt(params.id) },
            data: {
                metaTitle: body.metaTitle,
                metaDescription: body.metaDescription,
                focusKeyword: body.focusKeyword,
                canonicalUrl: body.canonicalUrl
            }
        });
        return NextResponse.json(study);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating case study seo' }, { status: 500 });
    }
}
