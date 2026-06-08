import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/lib/activity-log';

// POST /api/users/register — Register via invite token
export async function POST(request: Request) {
    try {
        const { token, name, email, password, roleAtWork } = await request.json();

        if (!token || !name || !email || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Validate password: minimum 8 characters, must contain letters and numbers
        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }
        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
            return NextResponse.json({ error: 'Password must contain both letters and numbers' }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // Verify invite token
        const invite = await prisma.inviteToken.findUnique({ where: { token } });

        if (!invite) {
            return NextResponse.json({ error: 'Invalid invitation link' }, { status: 400 });
        }

        if (invite.usedAt) {
            return NextResponse.json({ error: 'This invitation has already been used' }, { status: 400 });
        }

        if (new Date() > invite.expiresAt) {
            return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 });
        }

        // If invite was sent to a specific email, verify it matches
        if (invite.email && invite.email.toLowerCase() !== email.toLowerCase()) {
            return NextResponse.json({ error: 'This invitation was sent to a different email address' }, { status: 400 });
        }

        // Check if email already exists
        const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (existing) {
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
        }

        // Hash password with bcrypt (cost 12)
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user with Pending status — requires admin approval
        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role: invite.role,
                workRole: roleAtWork?.trim() || null,
                status: 'Pending',
            }
        });

        // Mark invite token as used
        await prisma.inviteToken.update({
            where: { id: invite.id },
            data: { usedAt: new Date() }
        });

        await logActivity({
            userId: user.id,
            userName: name.trim(),
            userEmail: email.toLowerCase().trim(),
            action: 'create',
            target: 'Registration',
            detail: `New user registered via invite link (role: ${invite.role}, status: Pending)`,
        });

        return NextResponse.json({
            message: 'Registration successful. Your account is pending admin approval.',
            user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status }
        });
    } catch (err) {
        console.error('Registration error:', err);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
