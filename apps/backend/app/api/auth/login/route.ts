import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const { allowed, retryAfter } = checkRateLimit(ip);

    if (!allowed) {
        return NextResponse.json(
            { success: false, error: `Too many login attempts. Try again in ${retryAfter} seconds.` },
            { status: 429 }
        );
    }

    try {
        const raw = await req.json();
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid input' },
                { status: 400 }
            );
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !(await verifyPassword(password, user.password))) {
            return NextResponse.json(
                { success: false, error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const token = await createToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        await setAuthCookie(token);

        return NextResponse.json({
            success: true,
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
