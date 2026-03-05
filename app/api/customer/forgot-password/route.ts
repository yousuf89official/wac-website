import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/validations';
import { generateResetToken, getResetTokenExpiry, hashPassword } from '@/lib/auth-customer';

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

        // TODO: Send email with reset link
        // For now, log the token (development only)
        if (process.env.NODE_ENV !== 'production') {
            console.log(`Password reset token for ${customer.email}: ${resetToken}`);
        }

        return NextResponse.json({
            success: true,
            message: 'If an account exists with that email, a reset link has been sent.',
            // Include token in dev for testing
            ...(process.env.NODE_ENV !== 'production' ? { resetToken } : {}),
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
