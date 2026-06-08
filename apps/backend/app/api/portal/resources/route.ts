import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireCustomer } from '@/lib/auth-customer';
import { savedResourceSchema } from '@/lib/validations';

export async function GET() {
    const auth = await requireCustomer();
    if (auth instanceof NextResponse) return auth;

    const resources = await prisma.savedResource.findMany({
        where: { customerId: auth.customerId },
        orderBy: { savedAt: 'desc' },
    });

    return NextResponse.json({ resources });
}

export async function POST(req: NextRequest) {
    const auth = await requireCustomer();
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const parsed = savedResourceSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const resource = await prisma.savedResource.create({
        data: {
            customerId: auth.customerId,
            resourceName: parsed.data.resourceName,
            resourceUrl: parsed.data.resourceUrl,
            resourceType: parsed.data.resourceType,
            courseId: parsed.data.courseId ?? null,
        },
    });

    return NextResponse.json({ resource }, { status: 201 });
}
