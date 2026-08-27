/**
 * Tests the AuthContext.
 * Verifies session persistence and automatic logout when an authenticated request returns 401.
 */
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { apiRequest } from '../api/client';

// Must match the STORAGE_KEY constant in AuthContext.tsx.
const STORAGE_KEY = 'playblocks.auth';

function TestConsumer() {
  const { token } = useAuth();
  return (
    <div>
      <span data-testid="token">{token ?? 'none'}</span>
      <button onClick={() => apiRequest('/playbooks', { token }).catch(() => { })}>Make authenticated call</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // Checks that a previously logged-in user stays logged in across a page
  // reload, since AuthProvider seeds its state from localStorage on mount.
  it('restores a persisted session from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: 'abc', user: { id: '1', email: 'a@b.com' } }));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('token').textContent).toBe('abc');
  });

  // Checks the end-to-end wiring behind AuthContext's registration with client.ts:
  // a real apiRequest call through a mocked fetch that 401s must clear both React
  // state and localStorage, not just one of the two.
  it('logs the user out (and clears storage) when an authenticated request comes back 401', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: 'expired-token', user: { id: '1', email: 'a@b.com' } }),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' }),
      }),
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('token').textContent).toBe('expired-token');

    await act(async () => {
      screen.getByRole('button').click();
    });

    await waitFor(() => expect(screen.getByTestId('token').textContent).toBe('none'));
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
