import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import bcrypt from 'bcryptjs';

// PUT /api/users/password — Change current user's password
export async function PUT(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current password and new password are required' },
                { status: 400 }
            );
        }

        // Validate new password: 8+ characters, alphanumeric
        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'New password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        if (!/^[a-zA-Z0-9]+$/.test(newPassword)) {
            return NextResponse.json(
                { error: 'New password must contain only letters and numbers' },
                { status: 400 }
            );
        }

        // Fetch user with password
        const user = await prisma.user.findUnique({
            where: { id: session!.user.id },
            select: { id: true, password: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Validate current password with bcrypt
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 403 }
            );
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Password change error:', err);
        return NextResponse.json(
            { error: 'Failed to change password' },
            { status: 500 }
        );
    }
}
