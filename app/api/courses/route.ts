import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { courseCreateSchema } from '@/lib/validations';

export async function GET() {
    try {
        const courses = await prisma.course.findMany({
            where: { isPublished: true },
            orderBy: { order: 'asc' },
        });
        return NextResponse.json(courses);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching courses' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    try {
        const raw = await req.json();
        const parsed = courseCreateSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const course = await prisma.course.create({ data: parsed.data });
        return NextResponse.json(course);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
