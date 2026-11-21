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
 * Automatically intercepts relative API fetches in the browser if VITE_API_URL is set
 */
export function initApiInterceptor() {
  if (typeof window !== 'undefined' && API_BASE_URL) {
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
