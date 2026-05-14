/**
 * Central API client.
 * Uses NEXT_PUBLIC_API_URL env var; falls back to localhost for dev.
 * All components should use this instead of hardcoding http://localhost:3001.
 */

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '') + '/api';

export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * Build an API URL by appending a path.
 *   apiUrl('/exhibitions')          -> http://localhost:3001/api/exhibitions
 *   apiUrl('/exhibitions?limit=5')  -> http://localhost:3001/api/exhibitions?limit=5
 */
export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL.replace(/\/$/, '')}${cleanPath}`;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean | 'optional';
  /** When true, body is sent as FormData (for file upload) */
  formData?: boolean;
}

/**
 * Thin wrapper around fetch with auth token handling and JSON body.
 * Throws on network errors, returns parsed JSON otherwise.
 */
export async function apiFetch<T = unknown>(
  path: string,
  opts: ApiFetchOptions = {}
): Promise<ApiResult<T>> {
  const { body, auth = 'optional', formData, headers: extraHeaders, ...rest } = opts;

  const headers: Record<string, string> = {
    ...(extraHeaders as Record<string, string>),
  };

  if (!formData) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (auth === true) {
      return { success: false, error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } };
    }
  }

  let fetchBody: BodyInit | undefined;
  if (body !== undefined) {
    fetchBody = formData ? (body as BodyInit) : JSON.stringify(body);
  }

  try {
    const res = await fetch(apiUrl(path), { ...rest, headers, body: fetchBody });
    const json = (await res.json().catch(() => ({}))) as ApiResult<T>;
    if (!res.ok && !json.error) {
      return { success: false, error: { message: `HTTP ${res.status}`, code: 'HTTP_ERROR' } };
    }
    return json;
  } catch (err) {
    console.error('[apiFetch] Network error:', err);
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : 'Network error',
        code: 'NETWORK_ERROR',
      },
    };
  }
}
