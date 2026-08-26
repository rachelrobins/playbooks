import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, ApiError, setUnauthorizedHandler } from './client';

// Minimal fake Response builder; only the bits apiRequest actually reads.
function fakeResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('apiRequest', () => {
  afterEach(() => {
    setUnauthorizedHandler(null);
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('returns parsed JSON on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse(200, { hello: 'world' })));

    const result = await apiRequest<{ hello: string }>('/thing');

    expect(result).toEqual({ hello: 'world' });
  });

  it('returns undefined for 204 responses without parsing a body', async () => {
    const json = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 204, json }));

    const result = await apiRequest('/thing');

    expect(result).toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it('throws an ApiError carrying the server error and code for non-2xx responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(fakeResponse(400, { error: 'Bad input', code: 'VALIDATION_ERROR' })),
    );

    await expect(apiRequest('/thing')).rejects.toMatchObject({
      status: 400,
      message: 'Bad input',
      code: 'VALIDATION_ERROR',
    });
  });

  it('wraps a network failure as an ApiError with status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(apiRequest('/thing')).rejects.toMatchObject({
      status: 0,
      message: 'Unable to reach the server. Please check your connection.',
    });
  });

  it('aborts and reports a timeout if the server never responds', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
          }),
      ),
    );

    const promise = apiRequest('/thing');
    const assertion = expect(promise).rejects.toMatchObject({
      status: 0,
      message: 'The request timed out. Please try again.',
    });

    await vi.advanceTimersByTimeAsync(10000);
    await assertion;
  });

  it('triggers the unauthorized handler on a 401 for an authenticated request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(fakeResponse(401, { error: 'Invalid or expired token', code: 'UNAUTHORIZED' })),
    );
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    await expect(apiRequest('/playbooks', { token: 'some-token' })).rejects.toBeInstanceOf(ApiError);

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('does not trigger the unauthorized handler on a 401 for a request without a token', async () => {
    // e.g. a failed login attempt is a 401 too, but there's no session to invalidate.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(fakeResponse(401, { error: 'Invalid email or password', code: 'UNAUTHORIZED' })),
    );
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    await expect(apiRequest('/auth/login', { method: 'POST', body: {} })).rejects.toBeInstanceOf(ApiError);

    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
