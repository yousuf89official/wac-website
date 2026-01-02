import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { email, password } = await req.json();
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (user && user.password === password) {
            // In a real app, send a JWT. For this mock, send user data.
            return NextResponse.json({
                success: true,
                user: { id: user.id, email: user.email, name: user.name }
            });
        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid email or password' },
                { status: 401 }
            );
        }
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
