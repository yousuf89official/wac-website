import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/validations';
import { generateResetToken, getResetTokenExpiry, hashPassword } from '@/lib/auth-customer';
import { resetPasswordUrl, SITE_URL } from '@/lib/urls';

// POST /api/customer/forgot-password — Request password reset
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Handle password reset (with token)
        if (body.token) {
            const parsed = resetPasswordSchema.safeParse(body);
            if (!parsed.success) {
                return NextResponse.json(
                    { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
                    { status: 400 }
                );
            }

            const customer = await prisma.customer.findFirst({
                where: {
                    passwordResetToken: parsed.data.token,
                    passwordResetExpires: { gt: new Date() },
                },
            });

            if (!customer) {
                return NextResponse.json(
                    { error: 'Invalid or expired reset token' },
                    { status: 400 }
                );
            }

            const hashed = await hashPassword(parsed.data.password);
            await prisma.customer.update({
                where: { id: customer.id },
                data: {
                    password: hashed,
                    passwordResetToken: null,
                    passwordResetExpires: null,
                },
            });

            return NextResponse.json({ success: true, message: 'Password reset successfully' });
        }

        // Handle forgot password request (generate token)
        const parsed = forgotPasswordSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const customer = await prisma.customer.findUnique({ where: { email: parsed.data.email } });

        // Always return success to prevent email enumeration
        if (!customer) {
            return NextResponse.json({
                success: true,
                message: 'If an account exists with that email, a reset link has been sent.',
            });
        }

        const resetToken = generateResetToken();
        const resetExpires = getResetTokenExpiry();

        await prisma.customer.update({
            where: { id: customer.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpires,
            },
        });

        // Build the absolute reset link. resetPasswordUrl() returns a relative
        // path while auth still lives on the apex (Phase 1); once
        // NEXT_PUBLIC_APP_URL points at app.wearecollaborative.net it becomes
        // absolute on its own. Prefix SITE_URL for the relative case so emails
        // always carry a fully-qualified link.
        const path = resetPasswordUrl(resetToken);
        const resetLink = path.startsWith('http') ? path : `${SITE_URL}${path}`;

        // TODO: Send email with `resetLink` (Resend). For now, log it in dev.
        if (process.env.NODE_ENV !== 'production') {
            console.log(`Password reset link for ${customer.email}: ${resetLink}`);
        }

        return NextResponse.json({
            success: true,
            message: 'If an account exists with that email, a reset link has been sent.',
            // Include the link in dev for testing (no email provider wired yet).
            ...(process.env.NODE_ENV !== 'production' ? { resetLink } : {}),
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
