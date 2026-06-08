import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { randomBytes } from 'crypto';
import { logActivity } from '@/lib/activity-log';

// POST /api/users/invite — Generate invite link
export async function POST(request: Request) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { email, role } = await request.json();

        // Validate role
        const validRoles = ['admin', 'manager', 'analyst', 'editor', 'viewer', 'client'];
        if (role && !validRoles.includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Check if email already registered
        if (email) {
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) {
                return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
            }
        }

        // Generate unique token
        const token = randomBytes(32).toString('hex');

        // Token expires in 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invite = await prisma.inviteToken.create({
            data: {
                token,
                email: email || null,
                role: role || 'viewer',
                expiresAt,
                createdBy: 'admin', // Will be replaced with actual admin id from session
            }
        });

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const inviteUrl = `${baseUrl}/register/${token}`;

        await logActivity({
            userName: 'Admin',
            userEmail: 'system',
            action: 'create',
            target: 'Invite',
            detail: `Generated invite link for ${email || 'any user'} with role ${role || 'viewer'}`,
        });

        return NextResponse.json({
            id: invite.id,
            token: invite.token,
            url: inviteUrl,
            email: invite.email,
            role: invite.role,
            expiresAt: invite.expiresAt,
        });
    } catch (err) {
        console.error('Invite error:', err);
        return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
    }
}

// GET /api/users/invite — List all invite tokens
export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const invites = await prisma.inviteToken.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return NextResponse.json(invites);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 });
    }
}
