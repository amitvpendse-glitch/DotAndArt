/**
 * Safe fetch utility that verifies responses are JSON before parsing.
 * Gracefully handles 404s, HTML fallback responses, and network blips
 * without uncaught JSON parsing syntax errors.
 */

export async function safeResponseJson<T = any>(
  res: Response,
  fallbackValue: any = null
): Promise<T> {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return fallbackValue as T;
    }
    const data = await res.json();
    return data as T;
  } catch (err) {
    console.warn('[safeResponseJson] Failed to parse JSON response', err);
    return fallbackValue as T;
  }
}

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit,
  fallbackValue: any = null
): Promise<T> {
  try {
    const res = await fetch(input, init);
    if (!res.ok) {
      return fallbackValue as T;
    }
    return await safeResponseJson<T>(res, fallbackValue);
  } catch (err) {
    console.warn(`[safeFetchJson] Failed to fetch or parse JSON for: ${String(input)}`, err);
    return fallbackValue as T;
  }
}
