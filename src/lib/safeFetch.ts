import { handleClientFallbackApi } from './clientFallbackApi';

export async function safeFetchJson<T>(url: string, options?: RequestInit, fallbackValue?: T): Promise<T> {
  const isApiRoute = typeof url === 'string' && url.startsWith('/api/');

  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    const isHtmlResponse = contentType.includes('text/html');

    // If server responded with error status or returned static HTML SPA fallback (e.g. on Vercel CDN)
    if (!res.ok || isHtmlResponse) {
      if (typeof window !== 'undefined' && isApiRoute) {
        try {
          const fallbackData = await handleClientFallbackApi<T>(url, options);
          if (fallbackData !== null && fallbackData !== undefined) {
            return fallbackData;
          }
        } catch (fallbackErr) {
          console.warn('[safeFetch] Fallback API error for', url, fallbackErr);
        }
      }
      if (fallbackValue !== undefined) return fallbackValue;
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    try {
      const data = await res.json();
      return data;
    } catch (parseErr) {
      if (typeof window !== 'undefined' && isApiRoute) {
        try {
          const fallbackData = await handleClientFallbackApi<T>(url, options);
          if (fallbackData !== null && fallbackData !== undefined) {
            return fallbackData;
          }
        } catch (fallbackErr) {
          console.warn('[safeFetch] Fallback API error for parse failure', url, fallbackErr);
        }
      }
      if (fallbackValue !== undefined) return fallbackValue;
      throw parseErr;
    }
  } catch (err) {
    if (typeof window !== 'undefined' && isApiRoute) {
      try {
        const fallbackData = await handleClientFallbackApi<T>(url, options);
        if (fallbackData !== null && fallbackData !== undefined) {
          return fallbackData;
        }
      } catch (fallbackErr) {
        console.warn('[safeFetch] Fallback API error on network catch for', url, fallbackErr);
      }
    }
    if (fallbackValue !== undefined) return fallbackValue;
    throw err;
  }
}

export async function safeResponseJson<T>(res: Response, fallbackValue: T): Promise<T> {
  try {
    if (!res.ok) return fallbackValue;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) return fallbackValue;
    const data = await res.json();
    return data !== undefined ? data : fallbackValue;
  } catch {
    return fallbackValue;
  }
}
