import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

interface LogParams {
    userId?: string;
    userName: string;
    userEmail: string;
    action: string;
    target: string;
    detail: string;
    severity?: 'info' | 'warning' | 'critical';
}

export async function logActivity(params: LogParams) {
    let ip = 'unknown';
    try {
        const hdrs = await headers();
        ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim()
            || hdrs.get('x-real-ip')
            || 'unknown';
    } catch {}

    try {
        await prisma.activityLog.create({
            data: {
                userId: params.userId || null,
                userName: params.userName,
                userEmail: params.userEmail,
                action: params.action,
                target: params.target,
                detail: params.detail,
                severity: params.severity || 'info',
                ip,
            }
        });
    } catch (err) {
        console.error('Failed to write activity log:', err);
    }
}
