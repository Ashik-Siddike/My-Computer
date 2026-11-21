/**
 * Unified API & Asset URL Resolver for My Computer E-Commerce
 * Seamlessly handles:
 *  1. Local Development (relative /api/... with Vite SSR middleware)
 *  2. Split Deployment (Vercel Frontend + Render Backend via VITE_API_URL)
 *  3. Fullstack Monolithic Deployment (Render serving static dist + /api)
 */

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/**
 * Returns a fully-qualified or relative API URL
 */
export function apiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

/**
 * Resolves static or uploaded image URLs
 * - Keeps data URLs and external URLs (e.g. Unsplash, CDN) untouched
 * - Prefixes /uploads/... with API_BASE_URL when deployed separately
 */
export function resolveImageUrl(
  url?: string | null,
  fallback = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=800&auto=format&fit=crop'
): string {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (withLeadingSlash.startsWith('/uploads/') || withLeadingSlash.startsWith('/api/')) {
    return API_BASE_URL ? `${API_BASE_URL}${withLeadingSlash}` : withLeadingSlash;
  }
  return withLeadingSlash;
}

/**
 * Standard fetch wrapper that automatically routes relative API paths through API_BASE_URL
 */
export async function apiFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  let target = input;
  if (typeof input === 'string') {
    if (input.startsWith('/api') || input.startsWith('/uploads')) {
      target = `${API_BASE_URL}${input}`;
    }
  }
  return fetch(target, init);
}

/**
 * Safely parses JSON from a fetch Response without throwing SyntaxError.
 * Handles empty responses (0 bytes), HTML errors, and server disconnects gracefully.
 */
export async function safeJson<T = any>(
  res: Response,
  defaultError = 'Request failed'
): Promise<{ ok: boolean; status: number; data: T }> {
  let text = '';
  try {
    text = await res.text();
  } catch (err: any) {
    return {
      ok: false,
      status: res.status || 500,
      data: { success: false, error: err.message || defaultError } as unknown as T,
    };
  }

  if (!text || !text.trim()) {
    return {
      ok: res.ok,
      status: res.status,
      data: {
        success: res.ok,
        error: res.ok ? undefined : `${defaultError} (HTTP ${res.status})`,
      } as unknown as T,
    };
  }

  try {
    const data = JSON.parse(text);
    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  } catch {
    return {
      ok: false,
      status: res.status,
      data: {
        success: false,
        error: `Server returned invalid response (HTTP ${res.status})`,
      } as unknown as T,
    };
  }
}

/**
 * Automatically intercepts relative API fetches in the browser if VITE_API_URL is set,
 * and adds a global safety net to Response.prototype.json to prevent "Unexpected end of JSON input" crashes.
 */
export function initApiInterceptor() {
  if (typeof window === 'undefined') return;

  // 1. Safe JSON Parser Net: prevents unhandled "Unexpected end of JSON input" across the entire app
  Response.prototype.json = async function () {
    try {
      const text = await this.text();
      if (!text || !text.trim()) {
        return {
          success: this.ok,
          error: this.ok ? undefined : `Server returned empty response (HTTP ${this.status})`,
        };
      }
      try {
        return JSON.parse(text);
      } catch {
        console.warn('[Safe JSON Net]: Non-JSON response received from server (HTTP ' + this.status + ')');
        return {
          success: false,
          error: `Server returned non-JSON response (HTTP ${this.status})`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to read response body',
      };
    }
  };

  // 2. Fetch URL redirect for split deployments
  if (API_BASE_URL) {
    const originalFetch = window.fetch.bind(window);
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      if (typeof input === 'string') {
        if (input.startsWith('/api') || input.startsWith('/uploads')) {
          return originalFetch(`${API_BASE_URL}${input}`, init);
        }
      }
      return originalFetch(input, init);
    };
  }
}

initApiInterceptor();
