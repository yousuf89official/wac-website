import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock getCurrentUser (Phase 4: replaces getServerSession from NextAuth)
const mockGetCurrentUser = vi.fn();
vi.mock('../session', () => ({
    getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

import { requireAuth, requireAdmin } from '../api-auth';

const buildUser = (overrides: Partial<{ id: string; email: string; role: string; name: string | null; permissions: string | null }> = {}) => ({
    id: overrides.id ?? 'user-1',
    email: overrides.email ?? 'test@example.com',
    role: overrides.role ?? 'viewer',
    name: overrides.name ?? 'Test User',
    permissions: overrides.permissions ?? null,
});

describe('requireAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 when no session', async () => {
        mockGetCurrentUser.mockResolvedValue(null);
        const result = await requireAuth();
        expect(result.error).not.toBeNull();
        expect(result.session).toBeNull();
        expect(result.error!.status).toBe(401);
    });

    it('returns session when authenticated', async () => {
        const user = buildUser();
        mockGetCurrentUser.mockResolvedValue(user);
        const result = await requireAuth();
        expect(result.error).toBeNull();
        expect(result.session?.user).toEqual({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            permissions: user.permissions,
        });
    });
});

describe('requireAdmin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 when not authenticated', async () => {
        mockGetCurrentUser.mockResolvedValue(null);
        const result = await requireAdmin();
        expect(result.error).not.toBeNull();
        expect(result.session).toBeNull();
        expect(result.error!.status).toBe(401);
    });

    it('returns 403 for non-admin roles', async () => {
        mockGetCurrentUser.mockResolvedValue(buildUser({ role: 'viewer' }));
        const result = await requireAdmin();
        expect(result.error).not.toBeNull();
        expect(result.session).toBeNull();
        expect(result.error!.status).toBe(403);
    });

    it.each(['admin', 'super_admin', 'masteradmin', 'Admin'])('grants %s', async (role) => {
        mockGetCurrentUser.mockResolvedValue(buildUser({ role }));
        const result = await requireAdmin();
        expect(result.error).toBeNull();
        expect(result.session?.user.role).toBe(role);
    });
});
