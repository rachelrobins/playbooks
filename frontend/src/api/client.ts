// Uses the configured API URL, falling back to the local backend during development.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

// Without this, a hung backend (deadlock, stalled network) leaves the UI stuck on
// "Loading…"/"submitting" forever with no way for the user to recover.
const REQUEST_TIMEOUT_MS = 10000;

// API error contract (see backend/src/middleware/errorHandler.ts): every non-2xx
// response body is { error: string, code?: string }. `code` is a stable machine-readable
// identifier (e.g. "UNAUTHORIZED", "NOT_FOUND"); `error` is a human-readable message safe
// to show directly to the user. Client code should read these fields, not guess at shape.
interface ApiErrorBody {
  error?: string;
  code?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Called whenever an authenticated request comes back 401, i.e. the session's token was
// rejected (expired/invalid) — not on a login/register attempt, which sends no token.
// AuthContext registers this to log the user out and let route guards redirect to /login.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  token?: string | null;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  // Attach the JWT when the request requires authentication.
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(0, 'The request timed out. Please try again.');
    }
    throw new ApiError(0, 'Unable to reach the server. Please check your connection.');
  } finally {
    clearTimeout(timeout);
  }

  // 204 responses have no body to parse.
  if (response.status === 204) {
    return undefined as T;
  }

  const data: ApiErrorBody = await response.json().catch(() => ({}));

  // Convert non-2xx responses into a consistent application error.
  if (!response.ok) {
    if (response.status === 401 && token) {
      onUnauthorized?.();
    }
    throw new ApiError(response.status, data.error ?? 'Something went wrong', data.code);
  }

  return data as T;
}
