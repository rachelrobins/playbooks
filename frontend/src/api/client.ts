// Uses the configured API URL, falling back to the local backend during development.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

// Without this, a hung backend (deadlock, stalled network) leaves the UI stuck on
// "Loading…"/"submitting" forever with no way for the user to recover.
const REQUEST_TIMEOUT_MS = 10000;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
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

  const data = await response.json().catch(() => ({}));

  // Convert non-2xx responses into a consistent application error.
  if (!response.ok) {
    throw new ApiError(response.status, data.error ?? 'Something went wrong');
  }

  return data as T;
}
