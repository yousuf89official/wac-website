import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the context modules that fetchClient imports
vi.mock('../../contexts/ErrorContext', () => ({
    triggerGlobalError: vi.fn(),
}));
vi.mock('../../contexts/DevConsoleContext', () => ({
    triggerDevLog: vi.fn(),
}));
vi.mock('../../contexts/LoadingContext', () => ({
    triggerLoading: vi.fn(),
}));

// Must import after mocks are set up
import { api } from '../api';
import { triggerGlobalError } from '../../contexts/ErrorContext';

// Use a simple resource for testing via the public api object
const usersApi = api.users;

describe('createCrudApi (via api.users)', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = mockFetch;
    });

    function mockOkResponse(data: any, status = 200) {
        mockFetch.mockResolvedValue({
            ok: true,
            status,
            json: () => Promise.resolve(data),
        });
    }

    function mockErrorResponse(status: number, body?: any) {
        mockFetch.mockResolvedValue({
            ok: false,
            status,
            json: () => Promise.resolve(body || { error: `Error ${status}` }),
        });
    }

    describe('getAll', () => {
        it('calls fetch with correct URL', async () => {
            mockOkResponse([{ id: '1', name: 'Alice' }]);

            const result = await usersApi.getAll();

            expect(mockFetch).toHaveBeenCalledOnce();
            const [url] = mockFetch.mock.calls[0];
            expect(url).toBe('/api/users');
            expect(result).toEqual([{ id: '1', name: 'Alice' }]);
        });

        it('appends query parameters when provided', async () => {
            mockOkResponse([]);

            await usersApi.getAll({ role: 'admin', status: 'active' });

            const [url] = mockFetch.mock.calls[0];
            expect(url).toContain('/api/users?');
            expect(url).toContain('role=admin');
            expect(url).toContain('status=active');
        });
    });

    describe('getById', () => {
        it('calls fetch with correct URL including id', async () => {
            mockOkResponse({ id: 'u1', name: 'Bob' });

            const result = await usersApi.getById('u1');

            const [url] = mockFetch.mock.calls[0];
            expect(url).toBe('/api/users/u1');
            expect(result).toEqual({ id: 'u1', name: 'Bob' });
        });
    });

    describe('create', () => {
        it('calls fetch with POST method and JSON body', async () => {
            const newUser = { name: 'Charlie', email: 'charlie@test.com', role: 'viewer', status: 'active' };
            mockOkResponse({ id: 'u2', ...newUser });

            await usersApi.create(newUser as any);

            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toBe('/api/users');
            expect(options.method).toBe('POST');
            expect(JSON.parse(options.body)).toEqual(newUser);
        });
    });

    describe('update', () => {
        it('calls fetch with PUT method and JSON body', async () => {
            const updates = { name: 'Charlie Updated' };
            mockOkResponse({ id: 'u2', ...updates });

            await usersApi.update('u2', updates);

            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toBe('/api/users/u2');
            expect(options.method).toBe('PUT');
            expect(JSON.parse(options.body)).toEqual(updates);
        });
    });

    describe('delete', () => {
        it('calls fetch with DELETE method', async () => {
            mockOkResponse({ message: 'Deleted' });

            await usersApi.delete('u2');

            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toBe('/api/users/u2');
            expect(options.method).toBe('DELETE');
        });
    });

    describe('error handling', () => {
        it('throws on non-ok response', async () => {
            mockErrorResponse(500, { error: 'Internal Server Error' });

            await expect(usersApi.getAll()).rejects.toThrow('Internal Server Error');
        });

        it('triggers global error for non-401 errors', async () => {
            mockErrorResponse(500, { error: 'Server broke' });

            await expect(usersApi.getAll()).rejects.toThrow();

            expect(triggerGlobalError).toHaveBeenCalledWith('API Error', 'Server broke');
        });

        it('does not trigger API Error for 401 responses (suppressed in if-block)', async () => {
            mockErrorResponse(401, { error: 'Unauthorized' });

            await expect(usersApi.getAll()).rejects.toThrow('Unauthorized');

            // The if-block skips triggerGlobalError for 401, but the catch block
            // may re-trigger it as a Network Error since "Unauthorized" doesn't match
            // the suppression patterns. This tests that the API Error path is skipped.
            const apiErrorCalls = (triggerGlobalError as any).mock.calls.filter(
                (c: any[]) => c[0] === 'API Error'
            );
            expect(apiErrorCalls).toHaveLength(0);
        });

        it('handles 204 No Content response', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 204,
                json: () => Promise.resolve({}),
            });

            const result = await usersApi.getAll();
            expect(result).toEqual({});
        });
    });
});
