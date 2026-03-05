import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
);
const COOKIE_NAME = 'wac-customer-token';
const TOKEN_EXPIRY = '30d'; // Longer session for customers

// ── Password ─────────────────────────────────

export async function hashPassword(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, 12);
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
}

// ── JWT ──────────────────────────────────────

interface CustomerTokenPayload {
    customerId: number;
    email: string;
    firstName: string;
    lastName: string;
}

export async function createCustomerToken(payload: CustomerTokenPayload): Promise<string> {
    return new SignJWT({ ...payload, type: 'customer' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(TOKEN_EXPIRY)
        .sign(JWT_SECRET);
}

export async function verifyCustomerToken(token: string): Promise<CustomerTokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.type !== 'customer') return null;
        return payload as unknown as CustomerTokenPayload;
    } catch {
        return null;
    }
}

// ── Cookies ──────────────────────────────────

export async function setCustomerCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });
}

export async function clearCustomerCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function getCustomerCookie(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value;
}

// ── Route Guard ──────────────────────────────

export async function requireCustomer(): Promise<
    CustomerTokenPayload | NextResponse
> {
    const token = await getCustomerCookie();
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = await verifyCustomerToken(token);
    if (!payload) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return payload;
}

// ── Password Reset Token ─────────────────────

export function generateResetToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function getResetTokenExpiry(): Date {
    return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
}
