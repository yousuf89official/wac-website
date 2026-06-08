import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/headers
vi.mock('next/headers', () => ({
    headers: vi.fn().mockResolvedValue({
        get: vi.fn().mockReturnValue(null),
    }),
}));

// Mock prisma
const mockCreate = vi.fn().mockResolvedValue({});
vi.mock('@/lib/prisma', () => ({
    prisma: {
        activityLog: {
            create: (...args: any[]) => mockCreate(...args),
        },
    },
}));

import { logActivity } from '../activity-log';

describe('logActivity', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCreate.mockResolvedValue({});
    });

    it('calls prisma.activityLog.create with correct fields', async () => {
        await logActivity({
            userId: 'user-1',
            userName: 'Test User',
            userEmail: 'test@example.com',
            action: 'LOGIN',
            target: 'auth',
            detail: 'User logged in',
        });

        expect(mockCreate).toHaveBeenCalledOnce();
        expect(mockCreate).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId: 'user-1',
                userName: 'Test User',
                userEmail: 'test@example.com',
                action: 'LOGIN',
                target: 'auth',
                detail: 'User logged in',
                severity: 'info',
            }),
        });
    });

    it('defaults severity to info when not provided', async () => {
        await logActivity({
            userName: 'Admin',
            userEmail: 'admin@example.com',
            action: 'VIEW',
            target: 'dashboard',
            detail: 'Viewed dashboard',
        });

        expect(mockCreate).toHaveBeenCalledWith({
            data: expect.objectContaining({
                severity: 'info',
            }),
        });
    });

    it('uses provided severity when specified', async () => {
        await logActivity({
            userName: 'Admin',
            userEmail: 'admin@example.com',
            action: 'DELETE',
            target: 'user',
            detail: 'Deleted a user',
            severity: 'critical',
        });

        expect(mockCreate).toHaveBeenCalledWith({
            data: expect.objectContaining({
                severity: 'critical',
            }),
        });
    });

    it('handles errors silently (does not throw)', async () => {
        mockCreate.mockRejectedValue(new Error('DB connection failed'));

        await expect(
            logActivity({
                userName: 'Admin',
                userEmail: 'admin@example.com',
                action: 'TEST',
                target: 'test',
                detail: 'This should not throw',
            })
        ).resolves.toBeUndefined();
    });

    it('sets userId to null when not provided', async () => {
        await logActivity({
            userName: 'Anonymous',
            userEmail: 'anon@example.com',
            action: 'VISIT',
            target: 'page',
            detail: 'Page visit',
        });

        expect(mockCreate).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId: null,
            }),
        });
    });
});
